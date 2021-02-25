<script>
	import entry from '../../controllers/entry';
	import NewCategory from './NewCategory.svelte';
	import Toast from 'svelte-toast';
	const toast = new Toast();

	let dateString = new Date().toISOString().slice(0, 10);

	let seperated = [];
	let data;
	entry.getDefaultEntries().then((resp) => {
		// Make sure that data.categories[0] is "Gemensamma"
		const gemensamma = resp.categories.indexOf('Gemensamma');
		if (gemensamma > 0) {
			let temporary = resp.categories[0];
			resp.categories[0] = resp.categories[gemensamma];
			resp.categories[gemensamma] = temporary;
		}

		// Separate the entries into its categories
		resp.categories.forEach((category) => {
			seperated[category] = resp.result.filter((entry) => entry.Category.name === category);
		});

		data = resp;
	});

	async function submit() {
		// combine all the categories into one array
		let combined = [];
		data.categories.forEach((category) => {
			combined = [...combined, ...seperated[category]];
		});

		// remove any empty entries
		combined = combined.filter((entry) => entry.value !== '' && entry.description !== '');

		// set the date of all the entries
		combined.forEach((entry) => {
			entry.date = new Date(dateString);
		});

		try {
			await entry.newEntry(combined);
			toast.success('Budget sparad!');
			page('/');
		} catch (err) {
			toast.error('Något gick fel.');
			console.error(err.message);
		}
	}
</script>

<div id="new-budget-wrapper">
	{#if data === undefined}
		<p>Hämtar standard raderna...</p>
	{:else}
		<div class="budget-container">
			{#each data.categories as category}
				<div class="budget">
					<NewCategory bind:entries={seperated[category]} {category} />
				</div>
			{/each}
		</div>

		<div class="center">
			<label>
				<p>Vilken månad gäller budgeten?</p>
				<input class="input-date" type="date" bind:value={dateString} />
			</label>
			<!-- bad hack -->
			<br />
			<button class="btn waves-effect waves-light indigo" on:click={submit}>Skicka</button>
		</div>
	{/if}
</div>

<style>
	#new-budget-wrapper {
		/* if on mobile the send button is at the very-very bottom
		hackily fix that */
		margin-bottom: 15px;
	}

	.budget-container {
		display: flex;
		justify-content: space-evenly;
		flex-wrap: wrap;
	}

	.budget {
		margin: 10px;
	}

	.input-date {
		/* Materalize sets width to 100% and takes a priority*/
		width: auto !important;
	}
</style>

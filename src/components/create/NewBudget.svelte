<script>
	import entry from '../../controllers/entry';
	import NewCategory from './NewCategory.svelte';
	import Toast from 'svelte-toast';
	import page from 'page';
	const toast = new Toast();

	let seperated = [];
	let data;
	entry.getDefaultEntries().then((result) => {
		// Make sure that data.categories[0] is "Gemensamma"
		const gemensamma = result.categories.indexOf('Gemensamma');
		if (gemensamma > 0) {
			let temporary = result.categories[0];
			result.categories[0] = result.categories[gemensamma];
			result.categories[gemensamma] = temporary;
		}

		// Separate the entries into its categories
		result.categories.forEach((category) => {
			seperated[category] = result.result.filter((entry) => entry.Category.name === category);
		});

		data = result;
	});

	async function submit() {
		// combine all the categories into one array
		let combined = [];
		data.categories.forEach((category) => {
			combined = [...combined, ...seperated[category]];
		});

		// remove any empty entries
		combined = combined.filter((entry) => entry.value !== '' && entry.description !== '');
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
					<NewCategory entries={seperated[category]} {category} />
				</div>
			{/each}
		</div>

		<div class="center">
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
</style>

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
			//let result = await entry.newEntry(combined);
			toast.success('Budget sparad!');
			page('/');
		} catch (err) {
			console.error(err.message);
		}
	}
</script>

{#if data === undefined}
	<p>Hämtar standard raderna...</p>
{:else}
	{#each data.categories as category}
		<div class="budget">
			<NewCategory entries={seperated[category]} {category} />
		</div>
	{/each}
	<button on:click={submit}>Skicka</button>
{/if}

<style>
	.budget {
		float: left;
		margin-right: 25px;
	}
</style>

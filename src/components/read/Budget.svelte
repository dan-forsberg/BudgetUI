<script lang="ts">
	import type IEntry from '../../interfaces/entry';
	import Category from './Category.svelte';
	export let date: Date;
	export let data: { categories: string[]; result: IEntry[] };

	// Make sure that data.categories[0] is "Gemensamma"
	const gemensamma = data.categories.indexOf('Gemensamma');
	if (gemensamma > 0) {
		let temporary = data.categories[0];
		data.categories[0] = data.categories[gemensamma];
		data.categories[gemensamma] = temporary;
	}

	let seperated = [];
	data.categories.forEach((category) => {
		seperated[category] = data.result.filter((entry) => entry.Category.name === category);
	});
</script>

<div>
	<h2>Budget {date.toISOString().slice(0, 10)}</h2>

	{#each data.categories as category}
		<div class="category">
			<Category entries={seperated[category]} {category} />
		</div>
	{/each}
</div>

<style>
	.category {
		float: left;
		margin-right: 40px;
	}
</style>

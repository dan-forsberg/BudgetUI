<script lang="ts">
	import type IEntry from '../../interfaces/entry';
	import Category from './Category.svelte';
	export let date: Date;
	export let data: { categories: string[]; result: IEntry[] };

	let seperated = [];

	data.categories.forEach((category) => {
		seperated[category] = data.result.filter((entry) => entry.Category.name === category);
	});
	// TODO: get the total from Gemensamma and insert it into Dan and Malin
	// figure out a way to not hardcode it
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

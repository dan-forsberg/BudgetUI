<script lang="ts">
	import type IEntry from '../../interfaces/entry';
	import Category from './Category.svelte';
	export let date: Date;
	export let data: { categories: string[]; result: IEntry[] };

	let seperated = [];

	data.categories.forEach((category) => {
		if (seperated[category] === undefined) {
			seperated[category] = [];
		}
		seperated[category] = data.result.filter((entry) => entry.Category.name === category);
	});
</script>

<div>
	<h2>Budget {date}</h2>

	{#each data.categories as category}
		<h3>{category}</h3>
		<Category entries={seperated[category]} />
	{/each}
</div>

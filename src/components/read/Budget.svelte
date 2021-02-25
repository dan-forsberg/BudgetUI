<script lang="ts">
	import type IEntry from '../../interfaces/entry';
	import ViewCategory from '../../components/read/Category.svelte';
	import EditCategory from '../../components/edit/EditCategory.svelte';

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

	// Which component should be rendered, EditCategory or ViewCategory?
	// Determined by which page this is
	let currPage = window.location.pathname;
	let component = currPage === '/edit' ? EditCategory : ViewCategory;
</script>

{#each data.categories as category}
	<div class="category">
		<svelte:component this={component} entries={seperated[category]} {category} />
	</div>
{/each}

<style>
	.category {
		float: left;
		margin-right: 40px;
	}

	@media screen and (max-width: 1080px) {
		.category {
			width: 100%;
		}
	}
</style>

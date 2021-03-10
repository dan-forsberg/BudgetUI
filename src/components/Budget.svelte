<!-- This should not be used directly, use SelectBudget.svelte -->
<script lang="ts">
import type IEntry from "../interfaces/entry";
import ViewCategory from "./read/ViewCategory.svelte";
import EditCategory from "./edit/EditCategory.svelte";

export let readOnly: boolean;
let component = readOnly === true ? ViewCategory : EditCategory;

export let data: { categories: string[]; result: IEntry[] };
let seperated = [];
gemensammaFirst();
separateCategories();

function gemensammaFirst() {
	const gemensamma = data.categories.indexOf("Gemensamma");
	if (gemensamma > 0) {
		let temporary = data.categories[0];
		data.categories[0] = data.categories[gemensamma];
		data.categories[gemensamma] = temporary;
	}
}

function separateCategories() {
	data.categories.forEach((category) => {
		seperated[category] = data.result.filter((entry) => entry.Category.name === category);
	});

	return seperated;
}
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

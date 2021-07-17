<!-- This should not be used directly, use SelectBudget.svelte -->
<script lang="ts">
  import type IEntry from "../interfaces/entry";
  import ViewCategory from "./read/ViewCategory.svelte";
  import EditCategory from "./edit/EditCategory.svelte";

  export let readOnly: boolean;
  const component = readOnly === true ? ViewCategory : EditCategory;

  export let data: { categories: string[]; result: IEntry[] };
  const seperated = [];

  separateCategories();

  function separateCategories() {
    data.categories.forEach((category) => {
      seperated[category] = data.result.filter(
        (entry) => entry.Category.name === category
      );
    });

    return seperated;
  }
</script>

{#each data.categories as category}
  <div class="col s12 m6 l4">
    <svelte:component
      this={component}
      entries={seperated[category]}
      {category} />
  </div>
{/each}

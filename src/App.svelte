<script lang="ts">
	import Category from './components/read/Category.svelte';
	import NewBudget from './components/create/NewBudget.svelte';
	import entry from './controllers/entry';
	import defaultEntryStore from './stores/defaultEntryStore';
	import category from './controllers/category';
	import categoryStore from './stores/categoryStore';

	entry.getDefaultEntries().then((res) => {
		defaultEntryStore.set(res);
	});

	category.getCategories().then((res) => {
		categoryStore.set(res);
	});

	let entries = [];
	let newBudget = false;
</script>

<button
	on:click|preventDefault={() => {
		newBudget = !newBudget;
	}}
>
	Lägg till budget
</button>

{#if newBudget}
	<NewBudget />
{:else}
	{#await entries}
		<p>Hämtar budgetar</p>
	{:then entries}
		{#if entries.length > 0}
			<Category {entries} />
		{:else}
			<p>Tomt!</p>
		{/if}
	{/await}
{/if}

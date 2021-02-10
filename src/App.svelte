<script lang="ts">
	import Category from './components/Category.svelte';
	import NewBudget from './components/NewBudget.svelte';
	import entry from './controllers/entry';
	import defaultEntryStore from './stores/defaultEntryStore';

	entry.getDefaultEntries().then((res) => {
		defaultEntryStore.set(res);
	});

	let entries = [];
	//let entries = entry.getSpecificEntries({ description: 'Nånting', amount: 200, category: 3 });
	let newBudget = true;
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

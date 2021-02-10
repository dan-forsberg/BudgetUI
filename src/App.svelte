<script lang="ts">
	import Category from './components/Category.svelte';
	import NewBudget from './components/NewBudget.svelte';
	import entry from './controllers/entry';
	import defaultEntryStore from './stores/defaultEntryStore';

	entry.getDefaultEntries().then((res) => {
		defaultEntryStore.set(res);
	});

	let entries = entry.getSpecificEntries({ description: 'Nånting', amount: 200, category: 3 });
</script>

{#await entries}
	<p>Hämtar</p>
{:then entries}
	{#if entries.length > 0}
		<Category {entries} />
	{:else}
		<p>Tomt!</p>
	{/if}
{/await}

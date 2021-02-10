<script lang="ts">
	// Populate categories store
	// TODO: move this to a more suitable place?
	import Category from './components/Category.svelte';
	import entry from './controllers/entry';

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

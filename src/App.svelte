<script lang="ts">
	// Populate categories store
	// TODO: move this to a more suitable place?
	import Category from './components/Category.svelte';
	import entry from './controllers/entry';

	let entries = entry.getAllEntries();
</script>

{#await entries}
	<p>Hämtar</p>
{:then entries}
	<Category {entries} />
{/await}

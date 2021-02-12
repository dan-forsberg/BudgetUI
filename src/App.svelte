<script lang="ts">
	import entry from './controllers/entry';
	import defaultEntryStore from './stores/defaultEntryStore';
	import category from './controllers/category';
	import categoryStore from './stores/categoryStore';
	import Budget from './components/read/Budget.svelte';

	entry.getDefaultEntries().then((res) => {
		defaultEntryStore.set(res);
	});

	category.getCategories().then((res) => {
		categoryStore.set(res);
	});

	let data = entry.getSpecificEntries({ date: new Date('2021-01') });
</script>

{#await data}
	<p>Hämtar budgetar</p>
{:then data}
	<Budget {data} date={new Date('2021-01')} />
{/await}

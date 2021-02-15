<script lang="ts">
	import entry from '../../controllers/entry';
	import Budget from './Budget.svelte';

	let dateString = new Date().toISOString().slice(0, 10);
	let data;
	$: {
		data = entry.getSpecificEntries({ date: new Date(dateString) });
	}
</script>

<div>
	<input id="datepicker" type="date" bind:value={dateString} />
</div>
{#await data}
	<p>Hämtar budgetar</p>
{:then data}
	<Budget {data} date={new Date(dateString)} />§
{/await}

<style>
	div {
		width: auto;
	}
</style>

<script lang="ts">
	import entry from '../../controllers/entry';
	import Budget from './Budget.svelte';

	let dateString = new Date().toISOString().slice(0, 10);
	let data;
	$: {
		data = entry.getSpecificEntries({ date: new Date(dateString) });
	}
</script>

<input id="datepicker" type="date" bind:value={dateString} />

<div class="flex-container">
	{#await data}
		<p>Hämtar budgetar</p>
	{:then data}
		<Budget {data} date={new Date(dateString)} />
	{/await}
</div>

<style>
	.flex-container {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
	}

	@media screen and (max-width: 1080px) {
		.flex-container {
			flex-direction: column;
		}
	}
</style>

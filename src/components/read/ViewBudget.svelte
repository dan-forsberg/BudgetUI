<script lang="ts">
	import entry from '../../controllers/entry';
	import Budget from './Budget.svelte';

	let dateString = new Date().toISOString().slice(0, 10);
	let data;
	$: {
		data = entry.getSpecificEntries({ date: new Date(dateString) });
	}
</script>

<div class="flex-container">
	{#await data}
		<p>Hämtar budgetar</p>
	{:then data}
		<div>
			<h2>Budget <input id="datepicker" type="date" bind:value={dateString} /></h2>
			<Budget {data} />
		</div>
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

	#datepicker {
		font-size: 3.56rem;
		font-weight: 400;
		display: inline !important;
		width: auto !important;
		height: auto !important;
	}
</style>

<script>
	import defaultEntryStore from '../../../stores/defaultEntryStore';
	import InPlaceEdit from '../InPlaceEdit.svelte';
	import NewCategory from '../NewCategory.svelte';

	const now = new Date();
	const thisMonth = now.getMonth() < 10 ? '0' + now.getMonth() : now.getMonth();
	let title = `Budget ${now.getFullYear}-${thisMonth}`;

	function submit(field) {
		return ({ detail: newValue }) => {
			// IRL: POST value to server here
			console.log(`updated ${field}, new value is: "${newValue}"`);
		};
	}
</script>

<div class="budget-wrapper">
	<h1>
		<InPlaceEdit bind:value={title} on:submit={submit('title')} />
	</h1>
	<NewCategory values={$defaultEntryStore} {submit} />
</div>

<style>
	.budget-wrapper {
		margin: 0 auto;
	}
</style>

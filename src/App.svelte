<script lang="ts">
	import ViewBudget from './components/read/ViewBudget.svelte';
	import NewBudget from './components/create/NewBudget.svelte';
	import router from 'page';

	let page = ViewBudget;
	router('/', () => {
		page = ViewBudget;
	});
	router('/new', () => {
		page = NewBudget;
	});
	router.start();
</script>

<svelte:component this={page} />

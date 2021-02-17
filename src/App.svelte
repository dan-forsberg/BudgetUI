<script lang="ts">
	import ViewBudget from './components/read/ViewBudget.svelte';
	import NewBudget from './components/create/NewBudget.svelte';
	import router from 'page';
	import Navigator from './components/Navigator.svelte';

	let page = ViewBudget;
	router('/', () => {
		page = ViewBudget;
	});
	router('/new', () => {
		page = NewBudget;
	});
	router.start();
</script>

<link rel="stylesheet" href="/build/base.css" />

<Navigator />

<svelte:component this={page} />

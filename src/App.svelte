<script lang="ts">
import EditBudget from "./components/edit/EditBudget.svelte";
import ViewBudget from "./components/read/ViewBudget.svelte";
import NewBudget from "./components/create/NewBudget.svelte";

import Navigator from "./components/Navigator.svelte";
import router from "page";

let page = ViewBudget;

router("/", () => {
	page = ViewBudget;
});

router("/new", () => {
	page = NewBudget;
});

router("/edit", () => {
	page = EditBudget;
});

router("/budget/", () => {
	page = ViewBudget;
});

router("/budget/new", () => {
	page = NewBudget;
});

router("/budget/edit", () => {
	page = EditBudget;
});

router.start();
</script>

<svelte:head>
	<title>Budget planeraren 2000</title>
</svelte:head>

<link rel="stylesheet" href="/build/base.css" />

<Navigator />

<svelte:component this={page} />

<style>
:global(body) {
	/* Not sure if materialize or svelte is adding a padding, but something is */
	padding: 0px !important;
}
</style>

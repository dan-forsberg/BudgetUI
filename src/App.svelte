<script lang="ts">
import EditBudget from "./components/edit/EditBudget.svelte";
import ViewBudget from "./components/read/ViewBudget.svelte";
import NewBudget from "./components/create/NewBudget.svelte";
import Navigator from "./components/Navigator.svelte";
import { onLoggedIn, login } from "./auth";
import router from "page";

let page = null;

router("/", () => {
	page = ViewBudget;
});

router("/new", () => {
	page = NewBudget;
});

router("/edit", () => {
	page = EditBudget;
});

router.start();

let loggedIn = false;

onLoggedIn(() => {
	loggedIn = true;
	console.log("Inloggad.");
});
</script>

{#if loggedIn}
	<Navigator />
	<svelte:component this={page} />
{:else}
	<button on:click={() => login()}>Logga in</button>
{/if}

<style>
:global(body) {
	/* Not sure if materialize or svelte is adding a padding, but something is */
	padding: 0px !important;
}
</style>

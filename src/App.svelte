<script lang="ts">
import EditBudget from "./components/edit/EditBudget.svelte";
import ViewBudget from "./components/read/ViewBudget.svelte";
import NewBudget from "./components/create/NewBudget.svelte";
import Navigator from "./components/Navigator.svelte";
import { onMount } from "svelte";
import router from "page";

import createAuth0Client from "@auth0/auth0-spa-js";
let auth0 = null;
let isAuthenticated = false;

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

onMount(async () => {
	auth0 = await createAuth0Client({
		domain: "dev-dasifor.eu.auth0.com",
		client_id: "5qQ5xvpUl4gecTkaP95O1HpKhGoJMUD0",
	});

	isAuthenticated = await auth0.isAuthenticated();
	if (!isAuthenticated) {
		await auth0.loginWithRedirect({
			redirect_uri: window.location.origin,
		});
	} else {
		router.start();
	}
});
</script>

<Navigator />

<svelte:component this={page} />

<style>
:global(body) {
	/* Not sure if materialize or svelte is adding a padding, but something is */
	padding: 0px !important;
}
</style>

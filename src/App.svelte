<script lang="ts">
  import EditBudget from "./components/edit/EditBudget.svelte";
  import ViewBudget from "./components/read/ViewBudget.svelte";
  import NewBudget from "./components/create/NewBudget.svelte";
  import Navigator from "./components/Navigator.svelte";
  import NotLoggedIn from "./components/misc/NotLoggedIn.svelte";
  import Stats from "./components/read/ViewStats.svelte";
  import Login from "./components/misc/Login.svelte";
  import { onLoggedIn } from "./auth";
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

  router("/login", () => {
    page = Login;
  });

  router("/logout", () => {
    page = Login;
  });

  router("/stats", () => {
    page = Stats;
  });

  router("*", () => {
    page = ViewBudget;
  });

  router.start();

  let loggedIn = false;
  onLoggedIn(() => {
    loggedIn = true;
  });
</script>

<Navigator {loggedIn} />
<div class="container">
  <div class="row">
    {#if loggedIn}
      <svelte:component this={page} />
    {:else}
      <NotLoggedIn />
    {/if}
  </div>
</div>

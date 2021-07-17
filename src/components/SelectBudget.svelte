<script lang="ts">
  import entry from "../controllers/entry";
  import Budget from "./Budget.svelte";

  export let readOnly: boolean;

  let dateString = new Date().toISOString().slice(0, 10);
  let data;
  $: {
    data = entry.getSpecificEntries({ date: new Date(dateString) });
  }
</script>

<div>
  {#await data}
    <p>Hämtar budgetar</p>
  {:then data}
    <h2 class="center col s12 m12 l12">
      Budget
      <input type="date" bind:value={dateString} />
    </h2>

    <Budget {data} {readOnly} />
  {/await}
</div>

<style>
  input {
    width: auto !important;
    font-size: 3.56rem !important;
    height: auto !important;
  }
</style>

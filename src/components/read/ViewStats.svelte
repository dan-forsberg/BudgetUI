<script lang="ts">
  import entry from "../../controllers/entry";
  import { onMount } from "svelte";
  import Table from "../misc/table/Table.svelte";

  let flattened: any[];

  async function init() {
    const results = await entry.getAllEntries();
    const entries = results.result;

    flattened = entries.map((entry) => {
      return {
        kategori: entry.Category.name,
        beskrivning: entry.description,
        belopp: entry.amount,
        // JS turns what's supposed to be a Date-object into a string
        // @ts-ignore
        datum: entry.date.slice(0, 10),
      };
    });
  }

  onMount(() => {
    init();
  });
</script>

{#if !flattened}
  <p>Hämtar data... Detta kan ta ett tag.</p>
{:else}
  <Table input={flattened} />
{/if}

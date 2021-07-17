<script lang="ts">
  import type IEntry from "../../interfaces/entry";
  import { sortEntries } from "../../controllers/entry";

  export let entries: IEntry[];
  export let category: string;

  const { sortedEntries, total } = sortEntries(entries);
</script>

{#if entries !== undefined}
  <h3 class="truncate">{category}</h3>
  <table>
    <tr>
      <th>Beskrivning</th>
      <th class="right">Belopp</th>
    </tr>
    {#each sortedEntries as entry (entry.id)}
      <tr>
        <td>{entry.description}</td>
        <td class="right">{entry.amount}</td>
      </tr>
    {/each}
    <tr>
      <td>Totalt</td>
      <td class="right">{total < 0 ? total : "+" + total}</td>
    </tr>
  </table>
{:else}
  <p>No data?</p>
  <p>category = {category}</p>
{/if}

<style>
  tr:last-child {
    border-top: 2px solid black;
    font-weight: bold;
  }
</style>

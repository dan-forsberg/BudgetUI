<script lang="ts">
  import { onMount } from "svelte";

  export let input;
  /* do manipulations on entries, keep  as a backup */
  const backup = input;
  const keys = Object.keys(backup[0]);
  let entries = backup;

  let searchTerm = "";
  let sortOnKey = null;
  let asc = false;

  /**
   * Called from onclick-event - sorts the table depending on what key is clicked
   * @param key what key to sort the table on
   */
  const sortTable = (key: string) => {
    toggleArrow(key);
    sortOnKey = key;

    if (sortOnKey === key) {
      asc = !asc;
    }

    // assignment so Svelte updates
    entries = entries.sort((a, b) => {
      const test = a[sortOnKey] <= b[sortOnKey];

      if (asc) {
        return test ? 1 : -1;
      } else {
        return test ? -1 : 1;
      }
    });
  };

  const searchTable = () => {
    console.log(searchTerm);

    if (searchTerm === "") {
      entries = backup;
    } else {
      const [selector, needle] = getSelectorNeedle(searchTerm);

      if (keys.includes(selector)) {
        entries = searchSpecific(selector, needle);
      } else {
        entries = searchEverything(needle);
      }
    }
  };

  function toggleArrow(newKey: string) {
    const elem = document.getElementById(`${newKey}-arrow`);
    const oldElem = document.getElementById(`${sortOnKey}-arrow`);
    oldElem?.classList.add("hidden");

    elem.classList.remove("up", "down", "hidden");
    elem.classList.add(asc ? "up" : "down");
  }

  function getSelectorNeedle(searchTerm: string) {
    const colon = searchTerm.indexOf(":");

    let selector: string | null, needle: string;

    if (colon > -1) {
      selector = searchTerm.substring(0, colon);
      needle = searchTerm.substring(colon + 1).trim();
    } else {
      selector = null;
      needle = searchTerm;
    }

    return [selector, needle];
  }

  function searchSpecific(key: string, searchTerm: string) {
    return backup.filter((entry: object) =>
      entry[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  function searchEverything(searchTerm: string) {
    /*
      To save some time (feels like it at least), "compress" the object into a json-string
      remove the keys (replace(...))
      and look for the needle
    */
    return backup.filter(
      (entry: object) =>
        JSON.stringify(entry)
          .replace(/("\w+":)/g, "")
          .toLowerCase()
          .indexOf(searchTerm.toLowerCase()) !== -1
    );
  }
</script>

<input bind:value={searchTerm} on:input={() => searchTable()} type="search" />
<table>
  <thead>
    <tr>
      {#each keys as key}
        <th>
          <span class="arrow down up hidden" id="{key}-arrow" />
          <span id={key} on:click={() => sortTable(key)}>
            {key.toUpperCase()}</span>
        </th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each entries as row}
      <tr>
        {#each keys as key}
          <td>{row[key]}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table {
    width: 50%;

    margin-left: auto;
    margin-right: auto;
  }

  .arrow {
    border: solid black;
    border-width: 0 3px 3px 0;
    display: inline-block;
    padding: 3px;
  }

  .up {
    transform: rotate(-135deg);
  }

  .down {
    transform: rotate(45deg);
  }

  .hidden {
    display: none;
  }
</style>

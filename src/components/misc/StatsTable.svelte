<script lang="ts">
  import {
    getSelectorsValues,
    searchSpecific,
    searchEverything,
  } from "./SearchTable";

  export let input;
  let entries = input;
  const keys = Object.keys(input[0]);

  let sortOnKey = null;
  let asc = false;
  let total = undefined;
  let avg = undefined;

  let searchTerm = "";

  const sortTable = (key: string) => {
    toggleArrow(key);
    sortOnKey = key;

    if (sortOnKey === key) {
      asc = !asc;
    }

    // assignment so Svelte updates
    entries = entries.sort((a: Object, b: Object) => {
      const test = a[sortOnKey] <= b[sortOnKey];

      if (asc) {
        return test ? 1 : -1;
      } else {
        return test ? -1 : 1;
      }
    });
  };

  const searchTable = () => {
    if (searchTerm === "") {
      entries = input;
      total = avg = undefined;
    } else {
      const results = getSelectorsValues(searchTerm);
      if (results === null) {
        entries = searchEverything(entries, searchTerm);
      } else {
        let firstIteration = true;
        for (const selectorValue of results) {
          entries = searchSpecific(
            // make sure that we don't filter on an empty set
            firstIteration ? input : entries,
            selectorValue.selector,
            selectorValue.value
          );

          firstIteration = false;
        }
      }

      setTotAvg();
    }
  };

  function toggleArrow(newKey: string) {
    const elem = document.getElementById(`${newKey}-arrow`);
    const oldElem = document.getElementById(`${sortOnKey}-arrow`);
    oldElem?.classList.add("hidden");

    elem.classList.remove("up", "down", "hidden");
    elem.classList.add(asc ? "up" : "down");
  }

  function setTotAvg() {
    let tot = 0;

    entries.forEach((entry) => {
      tot += entry.belopp;
    });

    total = tot;
    avg = Math.round(tot / entries.length);
  }
</script>

<div>
  <input
    bind:value={searchTerm}
    on:input={() => searchTable()}
    type="search"
    placeholder="kategori: ..." />
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
      {#if total && avg}
        <tr id="average">
          <td colspan="2">Totalt/snitt</td>
          <td>{total} / {avg}</td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>

<style>
  div {
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

  #average,
  #total {
    font-weight: bold;
  }
</style>

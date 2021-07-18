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
  let meta = {
    total: undefined,
    average: undefined,
    startDate: null,
    endDate: null,
  };

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
      meta = {
        total: undefined,
        average: undefined,
        startDate: null,
        endDate: null,
      };
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

        setMeta();
      }
    }
  };

  function toggleArrow(newKey: string) {
    const elem = document.getElementById(`${newKey}-arrow`);
    const oldElem = document.getElementById(`${sortOnKey}-arrow`);
    oldElem?.classList.add("hide");

    elem.classList.remove("up", "down", "hide");
    elem.classList.add(asc ? "up" : "down");
  }

  function setMeta() {
    let total = 0;
    let startDate: Date, endDate: Date;

    entries.forEach((entry) => {
      total += entry.belopp;
      const date = new Date(entry.datum);
      if (startDate == null || startDate > date) {
        startDate = date;
      }

      if (endDate == null || endDate < date) {
        endDate = date;
      }
    });

    if (startDate) {
      meta.total = total;
      meta.average = Math.round(total / entries.length);
      meta.startDate = startDate.toISOString().slice(0, 10);
      meta.endDate = endDate.toISOString().slice(0, 10);
    }
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
            <span class="arrow down up hide" id="{key}-arrow" />
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
      {#if meta.total}
        <tr id="average">
          <td colspan="2">Totalt/snitt</td>
          <td>{meta.total} / {meta.average}</td>
          <td>{meta.startDate} - {meta.endDate}</td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>

<style>
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
  #average,
  #total {
    font-weight: bold;
  }
</style>

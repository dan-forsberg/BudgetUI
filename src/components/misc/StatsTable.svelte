<script lang="ts">
  export let input;
  /* do manipulations on entries, keep  as a backup */
  const backup = input;
  const keys = Object.keys(backup[0]);
  let entries = backup;

  let searchTerm = "";
  let sortOnKey = null;
  let asc = false;

  let total = undefined;
  let avg = undefined;

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
      entries = backup;
      total = avg = undefined;
    } else {
      const [selector, needle] = getSelectorNeedle(searchTerm);

      if (keys.includes(selector)) {
        /* the if-statement below makes things feel snappier
         * otherwise if you search for 'kategori', you'll likely have an empty table
         * then when you add a colon ('kategori:') all entries will be rendered which
         * is noticably not-one-bit snappy
         */
        if (needle != "") entries = searchSpecific(selector, needle);
      } else {
        entries = searchEverything(needle);
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

  function getSelectorNeedle(searchTerm: string) {
    let colon = searchTerm.indexOf(":");
    let selector, needle;

    if (colon > -1) {
      /* TODO: unbork */
      let count = 0;
      while (colon > -1 && count < 3) {
        selector = searchTerm.substring(0, colon);
        needle = searchTerm.substring(colon + 1).trim();

        console.log(selector);
        console.log(needle);

        const newSearchPos = searchTerm.search(/\s\S*:/);
        searchTerm = searchTerm.substring(newSearchPos);

        colon = searchTerm.indexOf(":");

        console.log(searchTerm + " " + colon);
        count++;
      }
    } else {
      selector = null;
      needle = searchTerm;
    }

    return [selector, needle];
  }

  function searchSpecific(key: string, searchTerm: string) {
    const result = backup.filter((entry: object) =>
      entry[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    return result;
  }

  function searchEverything(searchTerm: string) {
    /*
      To save some time (feels like it at least), "compress" the object into a json-string
      remove the keys (replace(...))
      and look for the needle
    */

    const result = backup.filter(
      (entry: object) =>
        JSON.stringify(entry)
          .replace(/("\w+":)/g, "")
          .toLowerCase()
          .indexOf(searchTerm.toLowerCase()) !== -1
    );

    return result;
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

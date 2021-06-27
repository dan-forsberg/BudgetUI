<script lang="ts">
import type { SeparatedEntries } from "../../controllers/entry";
import gemensamTotal from "../../stores/gemensamTotal";
import { sortEntries } from "../../controllers/entry";
import { onMount } from "svelte";
import { clickOutside } from "../../clickOutside";
import type IEntry from "../../interfaces/entry";

export let data: SeparatedEntries;
let total = -1;

/**
 * Some tables have a special entry with the description "HALF_OF_GEMENSAMMA"
 * This entry can have a value, for example -500 or +500
 *
 * The value is meant to be updated to be half of the total of the table
 * called "Gemensamma" + (whatever value it was originally)
 *
 * If this instance is presenting "Gemensamma" the total will be updated in
 * a svelte store. Otherwise this instance will update the value to half of
 * what's stored in the svelte store
 *
 * This entry's purpose is simply to "even out" the costs between two people
 * in a household which is the case for us, as one of us is studying and the
 * other working full time
 * (this is also the reason for the hard coded-ness)
 */
const HOGIndex = data.entries.findIndex((entry) => entry.description === "HALF_OF_GEMENSAMMA");
const HOGAmount = HOGIndex > -1 ? data.entries[HOGIndex].amount : 0;

if (HOGIndex > -1) {
	const HOG = data.entries[HOGIndex];
	HOG.description = "Halva gemensamma (" + (HOGAmount > 0 ? "+" : "") + HOGAmount + ")";
	gemensamTotal.subscribe((amount) => {
		//@ts-expect-error HOGAmount can be a string or a number, TS doesn't approve
		HOG.amount = amount / 2 + Number.parseInt(HOGAmount);
	});
}

function updateHOG() {
	if (data.category === "Gemensamma") {
		gemensamTotal.set(total);
	}
}

function removeEmptyRows() {
	data.entries = data.entries.filter((entry) => !isEntryEmpty(entry));
}

function isEntryEmpty(entry: IEntry) {
	return (entry.amount == null || entry.amount == "") && entry.description == "";
}

function isLastRowEmpty() {
	const last = data.entries[data.entries.length - 1];
	return isEntryEmpty(last);
}

function addNewRow(naive = false) {
	if (!naive && isLastRowEmpty()) return;

	const newEntry = {
		Category: data.entries[0].Category,
		description: "",
		amount: "",
		date: new Date(),
		new: true,
	};

	data.entries.push(newEntry);
	// force svelte to see the update
	data = data;
}

function updateTable() {
	removeEmptyRows();
	const { sortedEntries, total: updatedTotal } = sortEntries(data.entries);

	total = updatedTotal;
	data.entries = sortedEntries;

	const entriesLength = data.entries.length;
	const last = data.entries[entriesLength - 1];

	if (!isLastRowEmpty()) {
		addNewRow();
	}

	updateHOG();
	// force svelte to see the update
	data = data;
}

onMount(() => {
	updateTable();
});

$: {
	removeEmptyRows();
	addNewRow();
}
</script>

<h4>{data.category}</h4>
<!-- eslint/tslint might throw an error/warning for this, but it compiles fine  -->
<form use:clickOutside on:click_outside={updateTable}>
	{#each data.entries as entry}
		<div class="entry-container">
			<input
				type="text"
				placeholder="Beskrivning"
				bind:value={entry.description}
				disabled={entry.Category.continuousUpdate && !entry.new}
				class="description"
				on:blur={() => addNewRow()} />

			<input
				type="number"
				placeholder="Belopp"
				bind:value={entry.amount}
				class="amount"
				disabled={entry.Category.continuousUpdate && !entry.new}
				on:blur={() => addNewRow()} />
		</div>
	{/each}
	<div class="entry-container">
		<input disabled type="text" value="Totalt" class="description" />
		<input disabled type="number" bind:value={total} class="amount" />
	</div>
</form>

<style>
  /* !important, otherwise Materalize takes priority */
  .total input {
    color: black !important;
    border-bottom: 1px solid #9e9e9e !important;
    font-weight: bold;
  }
  .description {
    width: 70% !important;
  }

  .amount {
    width: 25% !important;
  }

  /* Remove arrows from number input */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type="number"] {
    -moz-appearance: textfield;
  }
</style>

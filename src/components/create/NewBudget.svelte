<script lang="ts">
import entry, { separateIntoCategories } from "../../controllers/entry";
import type { SeparatedEntries } from "../../controllers/entry";
import type IEntry from "../../interfaces/entry";
import NewCategory from "./NewCategory.svelte";
import { onMount } from "svelte";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import page from "page";

let data: SeparatedEntries[];
let date = whatIsNextMonth();

/**
 * Returns a string which is the 25:th of next month (YYYY-MM-DD)
 */
function whatIsNextMonth(): string {
	const now = new Date();
	const nextMonth = (now.getMonth() + 1) % 12;
	const year = now.getFullYear() + (nextMonth == 0 ? 1 : 0);

	return new Date(year, nextMonth, 25 + 1).toISOString().slice(0, 10);
}

onMount(async () => {
	const response = await entry.getDefaultEntries();
	data = separateIntoCategories(response);
});

async function submit() {
	/**
	 * The API wants all the entries in one array, so combine
	 * all the seperate entries into one, filter out any empty rows
	 * and any rows which belong to a category which is continuousUpdate
	 * and that do not have the entry.new flag set (ie old entries, we don't
	 * want to send duplicates to the API)
	 */

	const combined: IEntry[] = [];
	data.forEach((category) => {
		const filtered = category.entries.filter(
			(entry) =>
				// negation
				!(
					entry.amount === "" ||
					entry.description === "" ||
					(entry.Category.continuousUpdate && !entry.new)
				)
		);

		combined.push(...filtered);
	});

	// set the date for all the entries
	combined.forEach((entry) => (entry.date = new Date(date)));

	try {
		await entry.newEntry(combined);
		Toastify({
			text: "Budget sparad!",
			duration: 1200,
			gravity: "bottom",
			position: "center",
			// toastify says to use style: {background: "..."} instead,
			// but there is no documentation ATM and it doesn't seem to work
			backgroundColor: "limegreen",
		}).showToast();
		page("/");
	} catch (error) {
		Toastify({
			text: "Något gick fel.",
			duration: 3000,
			gravity: "bottom",
			position: "center",
			backgroundColor: "red",
		}).showToast();
		console.error(error);
	}
}
</script>

{#if data === undefined}
  <p>Hämtar standard raderna...</p>
{:else}
  {#each data as separatedCategory}
    <div class="col s12 m6 l4">
      <NewCategory bind:data={separatedCategory} />
    </div>
  {/each}

  <div class="col s12 m12 l12 center">
    <label for="date">Vilken månad gäller budgeten?</label>
    <input id="date" class="input-date" type="date" bind:value={date} />
    <br />
    <button class="btn waves-effect waves-light indigo" on:click={submit}
      >Skicka</button>
  </div>
{/if}

<style>
  .input-date {
    /* Materalize sets width to 100% and takes a priority*/
    width: auto !important;
  }
</style>

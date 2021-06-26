<script lang="ts">
import entry, { separateIntoCategories } from "../../controllers/entry";
import type { SeparatedEntries } from "../../controllers/entry";
import { onMount } from "svelte";
import NewCategory from "./NewCategory.svelte";
import type IEntry from "../../interfaces/entry";

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

	combined.forEach((entry) => (entry.date = new Date()));

	return;
}
</script>

<div id="new-budget-wrapper">
	{#if data === undefined}
		<p>Hämtar standard raderna...</p>
	{:else}
		<div class="budget-container">
			{#each data as separatedCategory}
				<div class="budget">
					<NewCategory bind:data={separatedCategory} />
				</div>
			{/each}
		</div>

		<div class="center">
			<label for="date">Vilken månad gäller budgeten?</label>
			<input id="date" class="input-date" type="date" bind:value={date} />
			<br />
			<button class="btn waves-effect waves-light indigo" on:click={submit}>Skicka</button>
		</div>
	{/if}
</div>

<style>
#new-budget-wrapper {
	/* if on mobile the send button is at the very-very bottom
		hackily fix that */
	margin-bottom: 15px;
}

.budget-container {
	display: flex;
	justify-content: space-evenly;
	flex-wrap: wrap;
}

.budget {
	margin: 10px;
}

.input-date {
	/* Materalize sets width to 100% and takes a priority*/
	width: auto !important;
}
</style>

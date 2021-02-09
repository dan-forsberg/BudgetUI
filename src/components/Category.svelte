<script lang="ts">
	import type IEntry from '../interfaces/entry';
	import EntryRow from './EntryRow.svelte';

	export let entries: IEntry[];

	/*  
	Sort the entries so that positive entries are sorted ascending (salary first)
	Sort the remaining, negative, entries descending
	Lön 		20000
	Försäkring	200
	Försäljning 100
	Hyra		-5000
	Mat			-4000
	Viaplay		-109
	...
	*/
	const descSort = (a, b) => b - a;
	let total = 0,
		negative = [],
		positive = [];

	// Filter out positive values into positive, negative into negative and find the total O(n)
	// Sort the arrays later O(n^2) if len < 10, otherwise O(n log(n))
	entries.forEach((entry) => {
		total += entry.amount;

		if (entry.amount > 0) {
			positive.push(entry);
		} else {
			negative.push(entry);
		}
	});

	negative.sort(descSort);
	positive.sort();

	let sortedEntries = [...positive, ...negative];
	let categoryName = entries[0].Category.name;
</script>

{#if categoryName !== undefined}
	<h1 class="entries-header">{categoryName}</h1>
	<table>
		<tr>
			<th>Beskrivning</th>
			<th>Belopp</th>
		</tr>
		{#each sortedEntries as entry (entry.id)}
			<EntryRow description={entry.description} amount={entry.amount} />
		{/each}
		<!-- use tr to be able to style just this one -->
		<tr>
			<td>Totalt</td>
			<td>{total}</td>
		</tr>
	</table>
{:else}
	<p>No data?</p>
	<p>category = {categoryName}</p>
{/if}

<style>
	table tr:last-child {
		border-top: 50px solid black;
		font-weight: bold;
	}
</style>

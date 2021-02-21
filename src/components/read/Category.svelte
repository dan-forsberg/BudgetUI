<script lang="ts">
	import type IEntry from '../../interfaces/entry';

	export let entries: IEntry[];
	export let category: string;

	/*  
	Filter out positive from negative values, sort biggest-lowest
	Lön 		20000 	(biggest)
	Försäljning 100 	(lowest)
	Hyra		-5000 	(biggest)
	Viaplay		-109 	(lowest)
	...
	*/
	let total: number = 0,
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

	negative.sort((a, b) => a.amount - b.amount);
	positive.sort((a, b) => b.amount - a.amount);

	let sortedEntries = [...positive, ...negative];
</script>

{#if entries !== undefined}
	<h3 class="entries-header">{category}</h3>
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
			<td class="right">{total < 0 ? total : '+' + total}</td>
		</tr>
	</table>
{:else}
	<p>No data?</p>
	<p>category = {category}</p>
{/if}

<style>
	table tr:last-child {
		border-top: 2px solid black;
		font-weight: bold;
	}
</style>

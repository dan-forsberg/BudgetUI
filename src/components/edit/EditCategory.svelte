<script lang="ts">
	import type IEntry from '../../interfaces/entry';
	import { sortEntries } from '../../controllers/entry';
	import InPlaceEdit from './InPlaceEdit.svelte';
	import entry from '../../controllers/entry';

	export let entries: IEntry[];
	export let category: string;

	let editedEntries: IEntry[] = [];

	const entryChanged = (entry, description, newValue) => {
		if (description) {
			entry.description = newValue;
		} else {
			entry.amount = newValue;
		}

		// if the entry has already been modified, change that
		let index = editedEntries.findIndex((e) => e.id == entry.id);
		if (index > 0) {
			editedEntries[index] = entry;
		} else {
			editedEntries.push(entry);
		}
	};

	const update = async () => {
		editedEntries.forEach((ent) => {
			entry.updateEntry(ent);
		});
	};

	const { sortedEntries, total } = sortEntries(entries);
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
				<InPlaceEdit
					value={entry.description}
					onSubmit={(value) => entryChanged(entry, true, value)}
				/>
				<InPlaceEdit
					value={entry.amount}
					onSubmit={(value) => entryChanged(entry, false, value)}
				/>
			</tr>
		{/each}
		<tr>
			<td>Totalt</td>
			<td class="right">{total < 0 ? total : '+' + total}</td>
		</tr>
	</table>
	<button on:click={() => update()}>Uppdatera</button>
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

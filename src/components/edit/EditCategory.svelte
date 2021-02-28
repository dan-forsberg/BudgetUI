<script>
	import { sortEntries } from '../../controllers/entry';
	import InPlaceEdit from './InPlaceEdit.svelte';
	import entry from '../../controllers/entry';
	import Toast from 'svelte-toast';
	const toast = new Toast();

	export let entries;
	export let category;
	let { sortedEntries, total } = sortEntries(entries);

	let editedEntries = [];

	const entryChanged = (entry, description, newValue) => {
		console.log('entryChanged called');

		if (description) {
			entry.description = newValue;
		} else {
			entry.amount = newValue;
		}

		// if the entry has already been modified, change that instance
		let index = editedEntries.findIndex((e) => e.id == entry.id);
		if (index > 0) {
			editedEntries[index] = entry;
		} else {
			editedEntries.push(entry);
		}
	};

	const update = async () => {
		let success = true;

		for (const editedEntry of editedEntries) {
			try {
				await entry.updateEntry(editedEntry);
			} catch (err) {
				toast.error(`Kunde inte uppdatera: ${editedEntry.description}`);
				success = false;
			}
		}

		if (success) {
			toast.success(`Uppdaterade ${editedEntries.length} rader.`);
		}
	};
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
			<td class="right">{total <= -1 ? total : '+' + total}</td>
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

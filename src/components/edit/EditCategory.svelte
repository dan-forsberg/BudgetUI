<script>
	import { sortEntries } from '../../controllers/entry';
	import InPlaceEdit from './InPlaceEdit.svelte';
	import entry from '../../controllers/entry';
	import Toast from 'svelte-toast';
	const toast = new Toast();

	export let entries;
	export let category;

	let editedEntries = [];

	const entryChanged = (entry, description, newValue) => {
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
		editedEntries.forEach((ent) => {
			try {
				entry.updateEntry(ent);
			} catch (err) {
				toast.error(`Kunde inte uppdatera: ${ent.description}`);
				success = false;
			}
		});

		if (success) {
			toast.success(`Uppdaterade ${editedEntries.length} rader.`);
		}
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

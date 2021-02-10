<!-- Terrible file name, needs to be changed -->
<script lang="ts">
	import InPlaceEdit from './InPlaceEdit.svelte';
	import type IEntry from '../interfaces/entry';

	export let values: IEntry[];

	const newRow = () => {
		values.push({ date: new Date(), description: '...', amount: undefined });
		values = values;
	};
</script>

{#if values}
	<h3>{values[0].Category.name}</h3>
	<table>
		<tr>
			<th>Beskrivning</th>
			<th>Belopp</th>
		</tr>
		{#each values as value}
			<tr>
				<td>
					<InPlaceEdit bind:value={value.description} />
				</td>
				<td>
					<InPlaceEdit bind:value={value.amount} />
				</td>
			</tr>
		{/each}
	</table>
	<button
		on:click={() => {
			newRow();
		}}>Ny rad</button
	>
	<button on:click={() => submit()}>Spara</button>
{:else}
	<p>Tomt!</p>
{/if}

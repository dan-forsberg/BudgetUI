<script>
	import gemensamTotal from './gemensamTotal';
	import { clickOutside } from '../../clickOutside';
	import { onMount } from 'svelte';

	export let entries;
	export let category;
	let total = 0;

	// special value to balance out if one person should pay more for the common costs
	// "half of gemsamma even outer"
	let HOG_evenOuter = 0;

	// some default entries can have a special first row with description
	// "HALF_OF_GEMENSAMMA" where the value should be the half of gemensamma's total
	// subscribe to the total and update the amount
	if (entries[0].description === 'HALF_OF_GEMENSAMMA') {
		let entry = entries[0];
		HOG_evenOuter = entry.amount;

		let description = 'Halva gemensamma';
		if (HOG_evenOuter > 0) description += ` (+${HOG_evenOuter})`;
		else if (HOG_evenOuter < 0) description += ` (${HOG_evenOuter})`;
		entry.description = description;

		gemensamTotal.subscribe((value) => {
			entry.amount = value / 2 - HOG_evenOuter;
		});
	}

	const isEmptyString = (str) => {
		return str == undefined || str.length == 0;
	};

	// Update the total and remove any empty rows
	// Sort the entries by amount lowest - highest
	// Run when clicking outside the form and onMount()
	const update = () => {
		total = 0;
		let emptyEntries = [];
		entries.forEach((entry) => {
			if (isEmptyString(entry.description) && isEmptyString(entry.amount))
				emptyEntries.push(entry);
			else total += parseInt(entry.amount);
		});
		if (category === 'Gemensamma') {
			gemensamTotal.set(total);
		}

		entries = entries.filter((entry) => !emptyEntries.includes(entry));
		entries.sort((a, b) => {
			return a.amount - b.amount;
		});
	};

	const newRow = () => {
		entries.push({
			category: entries[0].Category.id,
			description: '',
			amount: '',
		});
	};

	$: {
		let len = entries.length;
		let last = entries[len - 1];
		// if the last row is not empty, add an empty row
		if (!isEmptyString(last.description) && !isEmptyString(last.amount)) {
			newRow();
		}
	}

	onMount(() => {
		update();
	});
</script>

<h4>{category}</h4>
<form use:clickOutside on:click_outside={update}>
	{#each entries as entry, index}
		<div class="entry-container">
			<input
				type="text"
				placeholder="Beskrivning"
				bind:value={entry.description}
				class="description"
			/>
			<input type="number" placeholder="Belopp" bind:value={entry.amount} class="amount" />
		</div>
	{/each}
	<div class="entry-container">
		<input disabled type="text" value="Totalt" class="description" />
		<input disabled type="number" bind:value={total} class="amount" />
	</div>
</form>

<style>
	/* !important, otherwise Materalize takes priority */
	input:disabled {
		color: black !important;
		border-bottom: 1px solid #9e9e9e !important;
		font-weight: 450;
	}

	.entry-container {
		display: flex;
		justify-content: space-between;
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
	input[type='number'] {
		-moz-appearance: textfield;
	}
</style>

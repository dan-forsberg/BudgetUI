<script>
	export let entries;
	export let category;

	$: {
		let len = entries.length;
		let last = entries[len - 1];

		// if the last row is not empty, add an empty row
		if (last.description !== '' && last.description !== '') {
			// copy the category ID from the previous value, it will be correct
			let categoryId = entries[0].Category.id;
			entries.push({
				category: categoryId,
				date: new Date(),
				description: '',
				amount: '',
			});
		}

		// pop the last row if the last two are empty
		// not working if you enter something into amount, then remove it
		if (
			entries.length > 2 &&
			entries[len - 1].description == '' &&
			entries[len - 2].description == '' &&
			entries[len - 1].amount == '' &&
			entries[len - 2].amount == ''
		) {
			entries.pop();
		}
	}
</script>

<h4>{category}</h4>
<form>
	{#each entries as entry}
		<input type="text" bind:value={entry.description} />
		<input type="number" bind:value={entry.amount} />
		<br />
	{/each}
</form>

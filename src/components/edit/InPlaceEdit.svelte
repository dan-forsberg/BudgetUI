<script>
import { onMount } from "svelte";

export let value,
	required = true,
	onSubmit;

let editing = false,
	original;

onMount(() => {
	original = value;
});

function edit() {
	editing = true;
}

function submit() {
	if (value !== original) {
		onSubmit(value);
	}

	editing = false;
}

function keydown(event) {
	if (event.key == "Escape") {
		event.preventDefault();
		value = original;
		editing = false;
	}
}

function focus(element) {
	element.focus();
}
</script>

{#if editing}
	<input bind:value on:blur={submit} {required} use:focus />
{:else}
	<td on:click={edit}>
		{value}
	</td>
{/if}

<style>
input {
	border: none;
	background: none;
	font-size: inherit;
	color: inherit;
	font-weight: inherit;
	text-align: inherit;
	box-shadow: none;
}
</style>

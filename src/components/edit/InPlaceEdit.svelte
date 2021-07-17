<script>
  import { onMount } from "svelte";
  export let value,
    required = true,
    onSubmit,
    right = false;

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

  function focus(element) {
    element.focus();
  }
</script>

{#if editing}
  <input bind:value on:blur={submit} {required} use:focus />
{:else}
  <td class={right ? "right" : ""} on:click={edit}>
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

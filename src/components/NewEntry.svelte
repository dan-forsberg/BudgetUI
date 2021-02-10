<script lang="ts">
	export let description: string;
	export let amount: number;
</script>

<input type="text" bind:value={description} />
<input type="number" bind:value={amount} />

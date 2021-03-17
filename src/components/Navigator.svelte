<script lang="ts">
import { login, logout } from "../auth";
export let loggedIn: boolean;
</script>

<nav class="indigo darken-3">
	<div class="nav-wrapper">
		<ul id="nav-mobile" class="left">
			<li><a href="/">Hem</a></li>
			<li><a href="/new">Ny budget</a></li>
			<li><a href="/edit">Ändra budget</a></li>
			{#if loggedIn}
				<li class="right"><a on:click={() => logout()}>Logga ut</a></li>
			{:else}
				<li class="right"><a on:click={() => login()}>Logga in</a></li>
			{/if}
		</ul>
	</div>
</nav>

<style>
a:visited {
	color: #fff;
}
</style>

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
		</ul>
		<ul id="nav-mobile" class="right">
			{#if loggedIn}
				<li><span on:click={() => logout()}>Logga ut</span></li>
			{:else}
				<li><span on:click={() => login()}>Logga in</span></li>
			{/if}
		</ul>
	</div>
</nav>

<style>
a:visited {
	color: #fff;
}
</style>

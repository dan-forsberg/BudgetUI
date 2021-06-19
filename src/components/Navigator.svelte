<script lang="ts">
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
				<li><a href="/login">Logga ut</a></li>
			{:else}
				<li><a href="/login">Logga in</a></li>
			{/if}
		</ul>
	</div>
</nav>

<style>
a:visited {
	color: #fff;
}
</style>

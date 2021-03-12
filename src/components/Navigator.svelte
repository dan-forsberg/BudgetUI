<script>
let URL = `${loc.protocol}//${loc.hostname}${loc.pathname}`;
</script>

<nav class="indigo darken-3">
	<div class="nav-wrapper">
		<ul id="nav-mobile" class="left">
			<li><a href={URL}>Hem</a></li>
			<li><a href="{URL}/new">Ny budget</a></li>
			<li><a href="{URL}/edit">Ändra budget</a></li>
		</ul>
	</div>
</nav>

<style>
a:visited {
	color: #fff;
}
</style>

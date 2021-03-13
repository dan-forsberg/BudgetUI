<script>
let loc = window.location;
let URL = `${loc.protocol}//${loc.hostname}`;

if (loc.pathname.substr(0, 7) == "/budget") {
	URL += "/budget";
}
</script>

<nav class="indigo darken-3">
	<div class="nav-wrapper">
		<ul id="nav-mobile" class="left">
			<li><a href="{URL}/">Hem</a></li>
			<li><a href="{URL}/new/">Ny budget</a></li>
			<li><a href="{URL}/edit/">Ändra budget</a></li>
		</ul>
	</div>
</nav>

<style>
a:visited {
	color: #fff;
}
</style>

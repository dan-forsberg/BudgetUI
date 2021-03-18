<script lang="ts">
import { isLoggedIn, login, logout } from "../../auth";

isLoggedIn().then((loggedIn) => {
	if (loggedIn) {
		logout();
	} else {
		login();
	}
});
</script>

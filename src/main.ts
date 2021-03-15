import App from "./App.svelte";
import { onLoggedIn } from "./auth";
import "../node_modules/materialize-css/dist/css/materialize.css";
import "../public/global.css";

let app;
onLoggedIn(() => {
	console.log("onLoggedIn");

	app = new App({
		target: document.body,
		props: {
		}
	});
});

export default app;
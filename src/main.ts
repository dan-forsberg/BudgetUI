import App from "./App.svelte";
import "../node_modules/materialize-css/dist/css/materialize.css";
import "../public/global.css";

const app = new App({
	target: document.body,
	props: {
	}
});


export default app;
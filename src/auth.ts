import createAuth0Client from "@auth0/auth0-spa-js";
import { Fetcher } from "./controllers/fetcher";
const loc = window.location;

const fetchAuthConfig = () => fetch("/auth_config.json");
let auth0 = null;
let isAuthenticated = false;

let callback: () => void;

export const onLoggedIn = (cb: () => void): void => {
	console.log("Callback set");
	callback = cb;
};

const configureClient = async () => {
	const response = await fetchAuthConfig();
	const config = await response.json();

	auth0 = await createAuth0Client({
		domain: config.domain,
		client_id: config.clientId,
		audience: config.audience,
	});
};

window.onload = async () => {
	if (loc.host !== "dasifor.xyz") {
		Fetcher.getInstance();
		console.log("host isnt dasifor");
		callback();
		return;
	}

	await configureClient();
	isAuthenticated = await auth0.isAuthenticated();
	if (isAuthenticated) {
		console.log("authed");
		callback();
		return;
	}

	const query = window.location.search;
	if (query.includes("code=") && query.includes("state=")) {
		await auth0.handleRedirectCallback();
		window.history.replaceState({}, document.title, "/");

		const token = await auth0.getTokenSilently();
		console.log("setting with token");
		callback();
		Fetcher.getInstance(token);
	} else {
		login();
	}
};


const login = async () => {
	await auth0.loginWithRedirect({
		redirect_uri: window.location.origin,
	});
};
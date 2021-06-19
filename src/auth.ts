import createAuth0Client from "@auth0/auth0-spa-js";
import { Fetcher } from "./controllers/fetcher";
const loc = window.location;

let auth0 = null;
let isAuthenticated = false;

let callback: () => void;

export const onLoggedIn = (cb: () => void): void => {
	callback = cb;
};

const configureClient = async () => {
	const response = await fetch("/auth_config.json");
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
		callback();
		return;
	}

	await configureClient();
	isAuthenticated = await auth0.isAuthenticated();
	if (isAuthenticated) {
		callback();
		return;
	}

	const query = window.location.search;
	if (query.includes("code=") && query.includes("state=")) {
		await auth0.handleRedirectCallback();
		window.history.replaceState({}, document.title, "/");

		const token = await auth0.getTokenSilently();
		callback();
		Fetcher.getInstance(token);
	}
};

export const isLoggedIn = async (): Promise<boolean> => {
	return await auth0.isAuthenticated();
};

export const login = async (): Promise<void> => {
	await auth0.loginWithRedirect({
		redirect_uri: window.location.origin,
	});
};
export const logout = (): void => {
	Fetcher.destroy();
	auth0.logout({
		returnTo: window.location.origin
	});
};
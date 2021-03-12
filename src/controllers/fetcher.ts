const loc = window.location;
let URL = `${loc.protocol}//${loc.hostname}/api`;

// if dev, use port 8080
if (loc.hostname === "0.0.0.0" || loc.hostname === "localhost" || loc.hostname === "127.0.0.1") {
	URL = `${loc.protocol}//${loc.hostname}:8080/api`;
}

const headers = { "Content-Type": "application/json" };

const httpReq = (endPoint: string, method: string, body?: unknown): Promise<Response> => {
	const opts = {
		method: method,
		headers: headers,
	};

	if (body) {
		opts["body"] = JSON.stringify(body);
	}
	const results = fetch(URL + endPoint, opts);
	return results;
};

const get = (endPoint: string): Promise<Response> => {
	return httpReq(endPoint, "GET");
};

const post = (endPoint: string, body: unknown): Promise<Response> => {
	return httpReq(endPoint, "POST", body);
};

/* delete is a reserved keyword */
const remove = (endPoint: string): Promise<Response> => {
	return httpReq(endPoint, "DELETE");
};

const patch = (endPoint: string, body: unknown): Promise<Response> => {
	return httpReq(endPoint, "PATCH", body);
};

export { get, post, remove, patch };
const URL = "http://0.0.0.0:8080/api";
const headers = { "Content-Type": "application/json" };

const httpReq = (endPoint: string, method: string, body?: unknown): Promise<Response> => {
	const opts = {
		method: method,
		headers: headers,
	};

	if (body) {
		opts["body"] = JSON.stringify(body);
	}
	console.log(`Sending request to ${URL + endPoint}`);
	const results = fetch(URL + endPoint, opts);
	console.log(results);
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
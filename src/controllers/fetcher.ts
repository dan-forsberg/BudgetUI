export class Fetcher {

	private constructor() {
		return;
	}

	private URL: string;
	private headers: HeadersInit;

	private static instance: Fetcher;

	public static getInstance(token?: string): Fetcher {
		if (!Fetcher.instance || token !== undefined) {
			console.log("No instance available");
			Fetcher.instance = new Fetcher();
			if (token != undefined) {
				console.log("Configured with token.");
				Fetcher.instance.configure(token);
			} else {
				console.log("Configure with no token.");
				Fetcher.instance.configure();
			}
		}

		return Fetcher.instance;
	}

	private httpReq(endPoint: string, method: string, body?: unknown): Promise<Response> {
		const opts = {
			method: method,
			headers: this.headers,
		};

		if (body) {
			opts["body"] = JSON.stringify(body);
		}
		const results = fetch(this.URL + endPoint, opts);
		return results;
	}

	public get(endPoint: string): Promise<Response> {
		return this.httpReq(endPoint, "GET");
	}

	public post(endPoint: string, body: unknown): Promise<Response> {
		return this.httpReq(endPoint, "POST", body);
	}

	/* delete is a reserved keyword */
	public remove(endPoint: string): Promise<Response> {
		return this.httpReq(endPoint, "DELETE");
	}

	public patch(endPoint: string, body: unknown): Promise<Response> {
		return this.httpReq(endPoint, "PATCH", body);
	}

	private configure(token?: string): void {
		const localhost = ["0.0.0.0", "localhost", "127.0.0.1"];
		const loc = window.location;

		this.URL = `${loc.protocol}//${loc.hostname}/api`;
		let prod = true;

		if (localhost.includes(loc.hostname)) {
			this.URL = `${loc.protocol}//${loc.hostname}:8080/api`;
			prod = false;
		} else if (loc.hostname === "budget.dasifor.xyz") {
			prod = false;
		}

		if (prod && token != undefined) {
			this.headers = {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			};
		} else {
			this.headers = {
				"Content-Type": "application/json"
			};
		}
	}
}
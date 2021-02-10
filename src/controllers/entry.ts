import type IEntry from "../interfaces/entry";
import { get, post, remove, patch } from "./fetcher";


const getAllEntries = async (): Promise<IEntry[]> => {
	const response = await get("/entry");
	const json = await response.json();

	if (response.status !== 200) {
		throw new Error(json.message);
	}

	return json;
};

const getDefaultEntries = async (): Promise<IEntry[]> => {
	const response = await get("/default");
	const json = await response.json();

	if (response.status !== 200) {
		throw new Error(json.message);
	}

	return json;
};

type GetAttributes = {
	date?: Date;
	description?: string;
	amount?: number;
	category?: number;
};
const getSpecificEntries = async (attributes: GetAttributes): Promise<IEntry[]> => {
	// Add the attributes as GET params
	let endPoint = "/entry/specific/?";
	for (const attribute in attributes) {
		endPoint += `${attribute}=${attributes[attribute]}&`;
	}
	endPoint = endPoint.slice(0, -1);

	const response = await get(endPoint);
	const json = await response.json();

	if (response.status !== 200) {
		throw new Error(json.message);
	}
	return json.result;
};

const newEntry = async (newEntry: IEntry | IEntry[]): Promise<IEntry> => {
	// the entries object has to be an array for the API
	let body;
	if (Array.isArray(newEntry))
		body = { entries: newEntry };
	else
		body = { entries: [newEntry] };

	const result = await post("/entry/new", body);
	const json = await result.json();

	if (result.status !== 201) {
		throw new Error(json.message);
	}
	return json;
};

export default { getAllEntries, getSpecificEntries, newEntry, getDefaultEntries };
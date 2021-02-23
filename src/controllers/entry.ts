import type IEntry from "../interfaces/entry";
import { get, post } from "./fetcher";

type GetResponse = { categories: string[]; result: IEntry[]; };

const getAllEntries = async (): Promise<GetResponse> => {
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
const getSpecificEntries = async (attributes: GetAttributes): Promise<GetResponse> => {
	// Add the attributes as GET params
	let endPoint = "/entry/specific/?";
	for (const attribute in attributes) {
		if (attribute === "date") {
			const date = attributes[attribute];
			endPoint += `year=${date.getFullYear()}&month=${date.getMonth() + 1}&`;
		} else {
			endPoint += `${attribute}=${attributes[attribute]}&`;
		}
	}

	const response = await get(endPoint);
	const json = await response.json();

	if (response.status !== 200) {
		throw new Error(json.message);
	}
	return json;
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

/**
 * Sort an array of entries from biggest to smallest values and get a total
 * This sorts [-200, 500, -500, 2000] => [2000, 500, -500, 200]
 * Used in displaying a Category and editing
 * 
 * @param entries An an array of unsorted entries
 */
const sortEntries = (entries: IEntry[]): {
	sortedEntries: IEntry[],
	total: number;
} => {
	/*  
	Filter out positive from negative values, sort biggest-lowest
	Lön 		20000 	(biggest)
	Försäljning 100 	(lowest)
	Hyra		-5000 	(biggest)
	Viaplay		-109 	(lowest)
	...
	*/
	let total = 0;
	const negative = [], positive = [];

	// Filter out positive values into positive, negative into negative and find the total O(n)
	// Sort the arrays later O(n^2) if len < 10, otherwise O(n log(n))
	entries.forEach((entry) => {
		total += entry.amount;

		if (entry.amount > 0) {
			positive.push(entry);
		} else {
			negative.push(entry);
		}
	});

	negative.sort((a, b) => a.amount - b.amount);
	positive.sort((a, b) => b.amount - a.amount);

	const sortedEntries = [...positive, ...negative];

	return { sortedEntries, total };
};

export default { getAllEntries, getSpecificEntries, newEntry, getDefaultEntries };
export { sortEntries };
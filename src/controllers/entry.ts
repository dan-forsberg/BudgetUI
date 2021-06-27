import type IEntry from "../interfaces/entry";
import { Fetcher } from "./fetcher";

type GetResponse = { categories: string[]; result: IEntry[]; };

const getAllEntries = async (): Promise<GetResponse> => {
	const fetcher = Fetcher.getInstance();
	const response = await fetcher.get("/entry");
	const json = await response.json();

	if (response.status !== 200) {
		throw new Error(json.message);
	}

	return json;
};

const getDefaultEntries = async (): Promise<GetResponse> => {
	const fetcher = Fetcher.getInstance();
	const response = await fetcher.get("/default");
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

	const fetcher = Fetcher.getInstance();
	const response = await fetcher.get(endPoint);
	const json = await response.json();

	if (response.status !== 200) {
		throw new Error(json.message);
	}
	return json;
};

const newEntry = async (newEntry: IEntry | IEntry[]): Promise<IEntry> => {
	// the entries object has to be an array for the API
	let body: { entries: IEntry[]; };
	if (Array.isArray(newEntry))
		body = { entries: newEntry };
	else
		body = { entries: [newEntry] };

	const fetcher = Fetcher.getInstance();
	const result = await fetcher.post("/entry/new", body);
	const json = await result.json();

	if (result.status !== 201) {
		throw new Error(json.message);
	}
	return json;
};

const updateEntry = async (entry: IEntry): Promise<IEntry> => {
	const fetcher = Fetcher.getInstance();
	const result = await fetcher.patch(`/entry/update/${entry.id}`, { entry: entry });
	const json = await result.json();

	if (result.status !== 200) {
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

	// Filter out positive values into positive, negative into negative and find the total 
	// Sort the arrays later
	entries.forEach((entry) => {
		//@ts-expect-error entry.amount could be string
		let entryAmount = Number.parseInt(entry.amount);
		if (isNaN(entryAmount))
			entryAmount = 0;

		total += entryAmount;

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

type SeparatedEntries = {
	category: string;
	entries: IEntry[];

};

const separateIntoCategories = (data: GetResponse): SeparatedEntries[] => {
	const separated: SeparatedEntries[] = [];
	data.categories.forEach((category) => {
		const temp = data.result.filter((entry) => entry.Category.name === category);
		separated.push({ category: category, entries: temp });
	});

	return separated;
};

export default { getAllEntries, getSpecificEntries, newEntry, getDefaultEntries, updateEntry };
export { sortEntries, separateIntoCategories };
export type { SeparatedEntries };
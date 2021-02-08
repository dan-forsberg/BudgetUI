import type IEntry from "../interfaces/entry";
import { get, post, remove, patch } from "./fetcher";


const getAllEntries = async (): Promise<IEntry[]> => {
	const response = await get("/entry");
	const json = await response.json();

	console.log(json);
	return null;
};

export default { getAllEntries };
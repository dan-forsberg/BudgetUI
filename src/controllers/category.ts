import { get, post, remove, patch } from "./fetcher";
import type ICategory from "../interfaces/category";

type GetCategoriesResp = {
	message?: string;
	categories: ICategory[];
};
const getCategories = async (): Promise<ICategory[]> => {
	const response = await get("/category");
	const json = await response.json() as GetCategoriesResp;

	if (response.status !== 200) {
		throw new Error(json.message);
	}

	return json.categories;
};

type AddCategoryResp = {
	message?: string;
	id: number;
	category: string;
};
const addCategory = async (category: string): Promise<ICategory> => {
	const response = await post("/category/new", { category: category });
	const json = await response.json() as AddCategoryResp;

	if (response.status !== 200) {
		throw new Error(json.message);
	}

	return json;
};

const removeCategory = async (id: number): Promise<unknown> => {
	return await remove(`/category/delete/${id}`);
};

const updateCategory = async (id: number, newName: string): Promise<unknown> => {
	return await patch(`/category/${id}`, { category: newName });
};

export default { getCategories, addCategory, removeCategory, updateCategory };
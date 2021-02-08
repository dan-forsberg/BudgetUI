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

type RemoveCategoryResp = {
	message?: string;
	rowsDeleted: number;
};
const removeCategory = async (id: number): Promise<number> => {
	const response = await remove(`/category/delete/${id}`);
	const json = await response.json() as RemoveCategoryResp;

	if (response.status !== 200) {
		throw new Error(json.message);
	}
	return json.rowsDeleted;
};

type UpdateCategoryResp = {
	message: string;
};
const updateCategory = async (id: number, newName: string): Promise<string> => {
	const response = await patch(`/category/update/${id}`, { category: newName });
	const json = await response.json() as UpdateCategoryResp;

	if (response.status !== 200) {
		throw new Error(json.message);
	}

	return json.message;
};

export default { getCategories, addCategory, removeCategory, updateCategory };
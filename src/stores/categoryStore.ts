import { writable } from "svelte/store";
import type ICategory from "../interfaces/category";

const categoryStore = writable<ICategory[]>([]);

export { categoryStore };
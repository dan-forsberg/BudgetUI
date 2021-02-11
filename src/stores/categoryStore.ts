import { writable } from "svelte/store";
import type category from "../interfaces/category";

const categoryStore = writable<category[]>([]);

export default categoryStore;
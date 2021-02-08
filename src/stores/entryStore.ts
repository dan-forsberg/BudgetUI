import { writable } from "svelte/store";
import type IEntry from "../interfaces/entry";

const entryStore = writable<IEntry[]>([]);

export default entryStore;
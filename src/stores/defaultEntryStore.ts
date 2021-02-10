import { writable } from "svelte/store";
import type IEntry from "../interfaces/entry";

const defaultEntryStore = writable<IEntry[]>([]);

export default defaultEntryStore;
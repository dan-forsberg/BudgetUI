import { writable } from "svelte/store";

const gemensamTotal = writable<number>(0);
export default gemensamTotal;
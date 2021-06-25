interface IEntry {
	id?: number;
	date: Date;
	description: string;
	amount: number;
	// what's sent from the api
	Category?: { name: string, continuousUpdate: boolean; };

	// used when sending entry to server
	CategoryId?: number;
}

export default IEntry;
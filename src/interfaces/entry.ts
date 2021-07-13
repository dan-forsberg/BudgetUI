interface IEntry extends Object {
	id?: number;
	date: Date;
	description: string;
	amount: number | string;
	Category: { name: string, continuousUpdate: boolean; };

	// only used by front-end to identify any new entries
	new?: boolean;
}

export default IEntry;
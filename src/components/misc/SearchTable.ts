/*
 * These functions were originally in StatsTable.svelte, but grew so big that I've moved them here
 * These functions help to filter the list of entries and also to filter searchterms
 */

type SelectorValue = {
	selector: string,
	value: string;
};

/**
 * Finds the first selector in a string and returns the selector, its length, its index and
 * anything that comes after the selector
 * In "foo: bar baz", "foo" is the selector and "bar baz" will be the rest
 * 
 * @param searchTerm A search term possibly consisting of a selector (foo)
 * 					 and value (bar baz) (foo: bar baz)
 * @returns match: the selector, length: length of the selector, 
 * 			rest: everything after the selector, index: where the selector is
 * 			every value is null if nothing is found
 */
function matchAndGetLength(searchTerm: string): { match: string, length: number, rest: string, index: number; } {
	// match "foo:" without consuming the : in "foo: bar baz"
	const selectorPattern = /\p{Letter}+(?=:)/u;

	const result = searchTerm.match(selectorPattern);
	if (result === null) {
		// not returning a simple null, otherwise TS will go bananas
		// if you destructure the return value
		return { match: null, length: null, rest: null, index: null };
	}

	const length = result[0].length;
	const match = result[0];
	// length + 1 to ignore the colon
	const rest = searchTerm.substring(length + 1).trim();

	return { match: match, length: length, rest: rest, index: result.index };
}


/**
 * Finds any selectors and its values in a string, returns an array of objects with results
 * If searchTerm is "foo: bar baz lorem: ipsum charlie: foxtrot" this will
 * give you [{foo: bar baz}, {lorem: ipsum}, {charlie: foxtrot}]
 * 
 * @param searchTerm A search term possibly consisting of one or more selector and values
 * @param selectorValues Do not use, this is for recursion
 * @returns An array of objects with the selector and its values
 */
function getSelectorsValues(searchTerm: string, selectorValues: SelectorValue[] = []): SelectorValue[] {
	const { match: selector, length, rest: potentialValue } = matchAndGetLength(searchTerm);
	if (selector === null || length === null) {
		return null;
	}

	// have we found all selectors?
	const hasNext = matchAndGetLength(potentialValue);
	if (hasNext.match !== null) {
		const actualValue = potentialValue.substring(0, hasNext.index).trim();
		const newSearchTerm = potentialValue.substring(hasNext.index);

		const results = { selector: selector, value: actualValue };

		return getSelectorsValues(
			newSearchTerm,
			[...selectorValues, results]
		);
	} else {
		const finalResults = { selector: selector, value: potentialValue };
		return [...selectorValues, finalResults];
	}
}

function searchSpecific(list: Record<string, unknown>[], key: string, searchTerm: string): Record<string, unknown>[] {
	const result = list.filter((entry) =>
		entry[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
	);

	return result;
}

function searchEverything(list: Record<string, unknown>[], searchTerm: string): Record<string, unknown>[] {
	/*
	  To save some time (feels like it at least), "compress" the object into a json-string
	  remove the keys (replace(...))
	  and look for the needle
	*/
	const result = list.filter(
		(entry) =>
			JSON.stringify(entry)
				.replace(/("\w+":)/g, "")
				.toLowerCase()
				.indexOf(searchTerm.toLowerCase()) !== -1
	);

	return result;
}

export { getSelectorsValues, searchSpecific, searchEverything };
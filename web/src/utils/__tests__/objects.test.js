import { getValues, getIds, deleteKeys, unique, buildObjectOfItems } from '../objects';

describe('getValues', () => {
	const objectsList = [
		{ fruits: ['apple', 'banana'] },
		{ fruits: ['orange', 'pear'] },
		{ vegetables: ['carrot', 'broccoli'] },
		{ vegetables: [] },
		{ other: 'item' },
		null,
		undefined
	];

	it('returns an array of values for a given key', () => {
		const result = getValues(objectsList, 'fruits');
		expect(result).toEqual(['apple', 'banana', 'orange', 'pear']);
	});

	it('returns an empty array if the key does not exist in any object', () => {
		const result = getValues(objectsList, 'not-a-key');
		expect(result).toEqual([]);
	});

	it('returns an empty array if objectsList is empty or undefined', () => {
		const result1 = getValues([], 'key');
		const result2 = getValues(undefined, 'key');
		const result3 = getValues(null);
		expect(result1).toEqual([]);
		expect(result2).toEqual([]);
		expect(result3).toEqual([]);
	});

	it('returns an array of values even if some objects do not have the key or the key value is falsy', () => {
		const result = getValues(objectsList, 'vegetables');
		expect(result).toEqual(['carrot', 'broccoli']);
	});
});

describe('getIds', () => {
	it('returns an array of ids for a given list of objects', () => {
		const objectsList = [
			{ id: 1 },
			{ id: 2 },
			{ id: 3 },
			{ id: 4 },
			{ id: 5 },
			null,
			undefined
		];
		const result = getIds(objectsList);
		expect(result).toEqual([1, 2, 3, 4, 5]);
	});

	it('returns an empty array if objectsList is empty or undefined', () => {
		const result1 = getIds([]);
		const result2 = getIds(undefined);
		const result3 = getIds(null);
		expect(result1).toEqual([]);
		expect(result2).toEqual([]);
		expect(result3).toEqual([]);
	});

	it('returns an array of ids even if some objects do not have an id or the id value is falsy', () => {
		const objectsList = [
			{ id: 1 },
			{ id: 2 },
			{ id: 3 },
			{ id: 4 },
			{ id: 5 },
			{ id: null },
			{ id: undefined },
			null,
			undefined
		];
		const result = getIds(objectsList);
		expect(result).toEqual([1, 2, 3, 4, 5]);
	});
});

describe('deleteKeys', () => {
	it('deletes the given keys from the given objects', () => {
		const objectsList = [
			{ id: 1, name: 'apple', color: 'red' },
			{ id: 2, name: 'banana', color: 'yellow' },
			{ id: 3, name: 'orange', color: 'orange' },
			{ id: 4, name: 'pear', color: 'green' },
			{ id: 5, name: 'carrot', color: 'orange' },
			null,
			undefined
		];
		const keys = ['id', 'color'];
		const result = deleteKeys(objectsList, keys);
		expect(result).toEqual([
			{ name: 'apple' },
			{ name: 'banana' },
			{ name: 'orange' },
			{ name: 'pear' },
			{ name: 'carrot' },
			null,
			undefined
		]);
	});

	it('returns an empty array if objectsList is empty or undefined', () => {
		const result1 = deleteKeys([], ['key']);
		const result2 = deleteKeys(undefined, undefined);
		const result3 = deleteKeys(null, null);
		expect(result1).toEqual([]);
		expect(result2).toEqual([]);
		expect(result3).toEqual([]);
	});

	it('returns an array of objects even if some objects do not have the key or the key value is falsy', () => {
		const objectsList = [
			{ id: 1, name: 'apple', color: 'red' },
			{ id: 2, name: 'banana', color: 'yellow' },
			{ id: 3, name: 'orange', color: 'orange' },
			{ id: 4, name: 'pear', color: 'green' },
			{ id: 5, name: 'carrot', color: 'orange' },
			null,
			undefined
		];
		const keys = ['id', 'color', 'not-a-key'];
		const result = deleteKeys(objectsList, keys);
		expect(result).toEqual([
			{ name: 'apple' },
			{ name: 'banana' },
			{ name: 'orange' },
			{ name: 'pear' },
			{ name: 'carrot' },
			null,
			undefined
		]);
	});
});

describe('unique', () => {
	it('returns an array of unique values', () => {
		const values = ['apple', 'banana', 'orange', 'apple', 'pear', 'banana'];
		const result = unique(values);
		expect(result).toEqual(['apple', 'banana', 'orange', 'pear']);
	});

	it('returns an empty array if values is empty or undefined', () => {
		const result1 = unique([]);
		const result2 = unique(undefined);
		const result3 = unique(null);
		expect(result1).toEqual([]);
		expect(result2).toEqual([]);
		expect(result3).toEqual([]);
	});
});

describe('buildObjectOfItems', () => {
	it('should return an empty object when passed an empty list', () => {
		expect(buildObjectOfItems([])).toEqual({});
	});

	it('should build an object with the ids as keys and objects as values', () => {
		const objectsList = [
			{ id: 1, name: 'object 1' },
			{ id: 2, name: 'object 2' },
			{ id: 3, name: 'object 3' },
		];

		const expected = {
			1: { id: 1, name: 'object 1' },
			2: { id: 2, name: 'object 2' },
			3: { id: 3, name: 'object 3' },
		};

		expect(buildObjectOfItems(objectsList)).toEqual(expected);
	});

	it('should ignore objects that do not have an "id" property', () => {
		const objectsList = [
			{ id: 1, name: 'object 1' },
			{ name: 'object without id' },
			{ id: 2, name: 'object 2' },
			{ id: 3, name: 'object 3' },
		];

		const expected = {
			1: { id: 1, name: 'object 1' },
			2: { id: 2, name: 'object 2' },
			3: { id: 3, name: 'object 3' },
		};

		expect(buildObjectOfItems(objectsList)).toEqual(expected);
	});

	it('should return empty obj when object list is empty, null or undefined', () => {
		expect(buildObjectOfItems([])).toEqual({});
		expect(buildObjectOfItems(null)).toEqual({});
		expect(buildObjectOfItems(undefined)).toEqual({});
	});
});

export class CacheMap {
	readonly #map = new Map();

	get<T>(key: unknown): T | undefined {
		return this.#map.get(key);
	}

	setAndReturn<T>(key: unknown, value: T): T {
		this.#map.set(key, value);
		return value;
	}
}

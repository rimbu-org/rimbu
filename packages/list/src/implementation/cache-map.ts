export class CacheMap {
  readonly map = new Map();

  get(key: any): any {
    return this.map.get(key);
  }

  setAndReturn<T>(key: any, value: T): T {
    this.map.set(key, value);
    return value;
  }
}

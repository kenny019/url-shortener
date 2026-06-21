// naive lru cache implementation
export class Cacher {
  private store = new Map<string, string>();
  private maxSize: number = 1000;

  constructor() {}

  get(key: string): string | null {
    const value = this.store.get(key);
    if (value === undefined) return null;

    // pushes to the end of map after deleting -> set
    this.store.delete(key);
    this.store.set(key, value);
    return value;
  }

  set(key: string, value: string): void {
    if (this.store.has(key)) {
      // pushes to the end of map
      this.store.delete(key);
    } else if (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) this.store.delete(oldestKey);
    }
    this.store.set(key, value);
  }
}

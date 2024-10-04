// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

export default class Set<T> extends Node {
    private items: T[];

    constructor(values?: readonly T[] | null = null) {
        this.items = values ? [...values] : [];
    }

    add(value: T): this {
        if (!this.has(value)) {
            this.items.push(value);
        }
        return this;
    }

    delete(value: T): boolean {
        const index = this.items.indexOf(value);
        if (index !== -1) {
            this.items.splice(index, 1);
            return true;
        }
        return false;
    }

    has(value: T): boolean {
        return this.items.includes(value);
    }

    clear(): void {
        this.items = [];
    }

    get size(): number {
        return this.items.length;
    }

    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void): void {
        for (const value of this.items) {
            callbackfn.call(value, value, this);
        }
    }
}
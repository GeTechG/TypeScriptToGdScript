// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

export default class ArrayUtils extends Node {
    static splice<T>(array: T[], start: number, deleteCount?: number, items: T[] = []): T[] {
        const result: T[] = [];
        const len = array.length;
        const actualStart = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
        const actualDeleteCount = deleteCount === undefined ? len - actualStart : Math.min(Math.max(deleteCount, 0), len - actualStart);

        // Copy elements before the start index
        for (let i = 0; i < actualStart; i++) {
            result.push(array[i]);
        }

        // Add new items
        for (const item of items) {
            result.push(item);
        }

        // Copy elements after the deleted elements
        for (let i = actualStart + actualDeleteCount; i < len; i++) {
            result.push(array[i]);
        }

        // Modify the original array
        array.length = 0;
        for (const item of result) {
            array.push(item);
        }

        // Return the deleted elements
        return array.slice(actualStart, actualStart + actualDeleteCount);
    }
    static forEach<T>(array: T[], callbackfn: Callable): void {
        for (let i = 0; i < array.length; i++) {
            callbackfn(array[i], i, array);
        }
    }
    static concat<T>(array: T[], value: Variant | never[]): T[] {
        if (value instanceof Array) {
            value.forEach((v: T) => array.push(v));
        } else {
            array.push(value);
        }
    }
    static from<T>(array : Dictionary, callbackfn: Callable | null = null): T[] {
        const result: T[] = [];
        for (let i = 0; i < array.length; i++) {
            result.push(callbackfn ? callbackfn(array[i], i, array) : null);
        }
        return result;
    }
    static flatMap<T>(array: T[], callbackfn: Callable): T[] {
        const result: T[] = [];
        for (let i = 0; i < array.length; i++) {
            const value: Variant | any[] = callbackfn(array[i], i, array);
            if (value instanceof Array) {
                value.forEach((v: T) => result.push(v));
            } else {
                result.push(value);
            }
        }
        return result;
    }
}
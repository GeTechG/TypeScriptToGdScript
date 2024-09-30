import * as fs from "node:fs";
import * as path from "path";

export function getAllFiles(dir: string, extension = '.ts'): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFiles(filePath));
        } else if (file.endsWith(extension)) {
            results.push(filePath);
        }
    });

    return results;
}

export function NotNullFiltered<T>(value: T[]): NonNullable<T>[] {
    return value.filter((v) => v !== null && v !== undefined);
}

export function NotEmptyStringFiltered(value: string): boolean {
    return value.trim() !== '';
}
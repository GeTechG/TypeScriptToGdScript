import * as fs from "node:fs";
import path from "node:path";

export function getAllFiles(dir: string, extension: string = '.ts'): string[] {
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
    return value.filter(Boolean) as NonNullable<T>[];
}
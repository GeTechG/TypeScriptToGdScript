import generateClasses from "./classes.js";
import fs from "node:fs";
import path from "node:path";

export default function generateLibrary(godotSourceDirectory: string) {
    const typeScriptToGdScriptDefs = fs.readFileSync(path.join(import.meta.dirname, '@TypeScriptToGdScript.d.ts'), 'utf-8');
    const classes = generateClasses(godotSourceDirectory);
    return [...classes, ['@TypeScriptToGdScript', typeScriptToGdScriptDefs]];
}
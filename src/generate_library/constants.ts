import parseDocs from "./docs.js";
import {sanitizeGodotNameForTs} from "./sanitizer.js";

export interface ClassConstant {
    "#text": string;
    "@_name": string;
    "@_value": string;
}

const classNamePattern = /(\w+)\(([^)]*)\)/;

function formatClassConstant(name: string, type: string, docs: string): string {
    return `${docs}\nstatic readonly ${name}: ${type};\n`;
}

function extractConstantDetails(constant: ClassConstant): { name: string, type: string, docs: string } {
    const name = sanitizeGodotNameForTs(constant["@_name"], 'property');
    let type = constant["@_value"];
    const match = constant["@_value"].match(classNamePattern);
    if (match) {
        type = match[1];
    }
    const docs = parseDocs(constant["#text"] + `\n@value ${constant["@_value"]}`);
    return { name, type, docs };
}

export function parseClassConstant(constant: ClassConstant): string {
    const { name, type, docs } = extractConstantDetails(constant);
    return formatClassConstant(name, type, docs);
}

export default function parseClassConstants(constants: ClassConstant[]): string {
    return constants.map(parseClassConstant).join('\n');
}
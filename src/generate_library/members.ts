import parseDocs from "./docs";
import {sanitizeGodotNameForTs} from "./sanitizer";
import gdTypeToTs from "./types";

export type ClassMember = {
    "#text": string;
    "@_name": string;
    "@_type": string;
    "@_setter"?: string;
    "@_getter"?: string;
    "@_default"?: string;
};

function formatClassMember(name: string, type: string, getter?: string, setter?: string, docs?: string): string {
    let output = `${docs}\n${name}: ${type};\n`;
    if (getter) {
        output += `${getter}(): ${type};\n`;
    }
    if (setter) {
        output += `${setter}(value: ${type}): void;\n`;
    }
    return output;
}

export function parseClassMember(member: ClassMember): string {
    const name = sanitizeGodotNameForTs(member["@_name"], 'property');
    const type = gdTypeToTs(member["@_type"]);
    const docs = parseDocs(member["#text"]);
    return formatClassMember(name, type, member["@_getter"], member["@_setter"], docs);
}

export default function parseClassMembers(members: ClassMember[]): string {
    return members.map(parseClassMember).join('\n');
}
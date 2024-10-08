import type {ClassMember} from "./members.js";
import parseDocs from "./docs.js";
import gdTypeToTs from "./types.js";

function formatSingletonMember(name: string, type: string, docs: string): string {
    return `${docs}\nexport const ${name}: ${type};\n`;
}

export function parseSingletonMember(member: ClassMember): string {
    const docs = parseDocs(member["#text"]);
    const name = member["@_name"];
    const type = gdTypeToTs(member["@_type"]);
    return formatSingletonMember(name, type, docs);
}

export default function parseSingletons(members: ClassMember[]): string {
    return members.map(parseSingletonMember).join('\n');
}
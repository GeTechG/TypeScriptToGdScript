import {type FunctionParam, parseFunctionParam} from "./functions.js";
import parseDocs from "./docs.js";

export interface ClassConstructor {
    return?: {
        "@_type": string;
    };
    param?: FunctionParam[];
    description: string;
}

function formatClassConstructor(params: string, docs: string): string {
    return `${docs}\nconstructor(${params});\n`;
}

export function parseClassConstructor(method: ClassConstructor): string {
    const docs = parseDocs(method.description);
    const params = method.param?.map(parseFunctionParam).join('') || '';
    return formatClassConstructor(params, docs);
}

export default function parseClassConstructors(methods: ClassConstructor[]): string {
    return methods.map(parseClassConstructor).join('\n');
}
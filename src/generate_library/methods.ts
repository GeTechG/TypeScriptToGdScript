import {FunctionParam, parseFunctionParam} from "./functions.js";
import parseDocs from "./docs.js";
import gdTypeToTs from "./types.js";

export interface ClassMethod {
    return?: {
        "@_type": string;
    };
    param?: FunctionParam[];
    description: string;
    "@_name": string;
    "@_qualifiers"?: string;
}

function formatClassMethod(name: string, params: string, returnType: string, docs: string): string {
    return `${docs}\n${name}(${params}): ${returnType};\n`;
}

export function parseClassMethod(method: ClassMethod): string {
    const docs = parseDocs(method.description);
    const name = method["@_name"];
    const isVararg = method["@_qualifiers"]?.includes('vararg');
    const params = isVararg ? '...args: any[]' : method.param?.map(parseFunctionParam).join('') || '';
    const returnType = gdTypeToTs(method.return?.["@_type"] || 'void');
    return formatClassMethod(name, params, returnType, docs);
}

export default function parseClassMethods(methods: ClassMethod[]): string {
    return methods.map(parseClassMethod).join('\n');
}
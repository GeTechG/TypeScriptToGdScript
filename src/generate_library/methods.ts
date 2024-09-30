import {type FunctionParam, parseFunctionParam} from "./functions.js";
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

const PREDEFINED_METHODS = new Map([
    ['get_node', 'get_node<T>(path: NodePath): T;'],
]);

function formatClassMethod(name: string, params: string, returnType: string, docs: string): string {
    return `${docs}\n${name}(${params}): ${returnType};\n`;
}

export function parseClassMethod(method: ClassMethod): string {
    const docs = parseDocs(method.description);
    const name = method["@_name"];
    const isVararg = method["@_qualifiers"]?.includes('vararg');
    const params = isVararg ? '...args: any[]' : method.param?.map(parseFunctionParam).join('') || '';
    const returnType = gdTypeToTs(method.return?.["@_type"] || 'void');
    if (PREDEFINED_METHODS.has(name)) {
        return `${docs}\n${PREDEFINED_METHODS.get(name)}\n`;
    }
    return formatClassMethod(name, params, returnType, docs);
}

export default function parseClassMethods(methods: ClassMethod[]): string {
    return methods.map(parseClassMethod).join('\n');
}
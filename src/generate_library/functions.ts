import gdTypeToTs from "./types";
import {sanitizeGodotNameForTs, sanitizeGodotValueForTs} from "./sanitizer";
import {ClassMethod} from "./methods";
import parseDocs from "./docs";

export const SKIP_FUNCTIONS = ['typeof'];

export type FunctionParam = {
    "@_index": number;
    "@_name": string;
    "@_type": string;
    "@_default"?: string;
};

function formatFunctionParam(name: string, type: string, defaultValue?: string): string {
    return defaultValue ?
        `${name}: ${type} = ${defaultValue},` :
        `${name}: ${type},`;
}

function formatFunction(name: string, params: string, returnType: string): string {
    return `export function ${name}(${params}): ${returnType};\n`;
}

export function parseFunctionParam(param: FunctionParam): string {
    const name = sanitizeGodotNameForTs(param["@_name"], 'argument');
    const type = gdTypeToTs(param["@_type"]);
    const defaultValue = param["@_default"] ? sanitizeGodotValueForTs(param["@_default"], type) : undefined;
    return formatFunctionParam(name, type, defaultValue);
}

export function parseFunction(method: ClassMethod): string {
    const params = method.param?.map(parseFunctionParam).join('') || '';
    const returnType = gdTypeToTs(method.return?.["@_type"] || 'void');
    return `${parseDocs(method.description)}\n${formatFunction(method["@_name"], params, returnType)}`;
}

export default function parseFunctions(methods: ClassMethod[]): string {
    return methods
        .filter(method => !SKIP_FUNCTIONS.includes(method["@_name"]))
        .map(parseFunction)
        .join('\n');
}
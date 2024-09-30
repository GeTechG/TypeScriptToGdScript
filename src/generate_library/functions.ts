import gdTypeToTs from "./types.js";
import {sanitizeGodotNameForTs, sanitizeGodotValueForTs} from "./sanitizer.js";
import type {ClassMethod} from "./methods.js";
import parseDocs from "./docs.js";

export const SKIP_FUNCTIONS = ['typeof', 'prints'];
export const RENAME_FUNCTIONS = new Map([
    ['print', 'gdprint']
]);

export interface FunctionParam {
    "@_index": number;
    "@_name": string;
    "@_type": string;
    "@_default"?: string;
}

function formatFunctionParam(name: string, type: string, isDefaultValue: boolean): string {
    return isDefaultValue ? `${name}?: ${type},` : `${name}: ${type},`;
}

function formatFunction(name: string, params: string, returnType: string): string {
    return `export function ${name}(${params}): ${returnType};\n`;
}

export function formatDefaultInfoDoc(param: FunctionParam[]): string {
    const defaultParams = param.filter(p => p["@_default"] !== undefined);
    if (defaultParams.length === 0) {
        return '';
    }
    return `* Defaults: \`${defaultParams.map(p => `${p["@_name"]}: ${p["@_default"]}`).join(', ')}\``;
}

export function parseFunctionParam(param: FunctionParam): string {
    const name = sanitizeGodotNameForTs(param["@_name"], 'argument');
    const type = gdTypeToTs(param["@_type"]);
    const defaultValue = param["@_default"] ? sanitizeGodotValueForTs(param["@_default"], type) : undefined;
    return formatFunctionParam(name, type, defaultValue !== undefined);
}

export function parseFunction(method: ClassMethod): string {
    const isVararg = method["@_qualifiers"]?.includes('vararg');
    const params = isVararg ? '...args: any[]' : method.param?.map(parseFunctionParam).join('') || '';
    const returnType = gdTypeToTs(method.return?.["@_type"] || 'void');
    const defaultInfoDoc = formatDefaultInfoDoc(method.param || []);
    return `${parseDocs(method.description, defaultInfoDoc)}\n${formatFunction(method["@_name"], params, returnType)}`;
}

export default function parseFunctions(methods: ClassMethod[]): string {
    return methods
        .filter(method => !SKIP_FUNCTIONS.includes(method["@_name"]))
        .map(method => {
            const name = RENAME_FUNCTIONS.get(method["@_name"]) || method["@_name"];
            return { ...method, "@_name": name };
        })
        .map(parseFunction)
        .join('\n');
}
import {formatDefaultInfoDoc, type FunctionParam, parseFunctionParam} from "./functions.js";
import parseDocs from "./docs.js";
import gdTypeToTs from "./types.js";

export const RENAME_ANNOTATIONS = new Map([
    ['@export', 'gdexport']
]);

export interface ClassAnnotation {
    return?: {
        "@_type": string;
    };
    param?: FunctionParam[];
    description: string;
    "@_name": string;
    "@_qualifiers"?: string;
}

function formatClassAnnotation(name: string, params: string | undefined, returnType: string, docs: string): string {
    if (params) {
        return `${docs}\nexport function ${name}(${params}): (target: any, context: any) => ${returnType};\n`;
    }
    return `${docs}\nexport function ${name}(target: any, context: any): ${returnType};\n`;
}

function getAnnotationDetails(method: ClassAnnotation): { name: string, params: string | undefined, returnType: string, docs: string } {
    const name = method["@_name"].replace('@', '');
    const isVararg = method["@_qualifiers"]?.includes('vararg');
    const params = isVararg ? `...args: ${gdTypeToTs(method.param![0]["@_type"])}[]` : method.param?.map(parseFunctionParam).join('');
    const defaultInfoDoc = formatDefaultInfoDoc(method.param || []);
    const returnType = gdTypeToTs(method.return?.["@_type"] || 'void');
    const docs = parseDocs(method.description, defaultInfoDoc);
    return { name, params, returnType, docs };
}

export function parseClassAnnotation(method: ClassAnnotation): string {
    const { name, params, returnType, docs } = getAnnotationDetails(method);
    return formatClassAnnotation(name, params, returnType, docs);
}

export default function parseClassAnnotations(methods: ClassAnnotation[]): string {
    return methods
        .map(annotation => {
            const name = RENAME_ANNOTATIONS.get(annotation["@_name"]) || annotation["@_name"];
            return { ...annotation, "@_name": name };
        })
        .map(parseClassAnnotation)
        .join('\n');
}
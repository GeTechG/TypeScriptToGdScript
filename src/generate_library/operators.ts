import {type FunctionParam, parseFunctionParam} from "./functions.js";
import parseDocs from "./docs.js";
import gdTypeToTs from "./types.js";

export interface ClassOperator {
    return?: {
        "@_type": string;
    };
    param?: FunctionParam[];
    description: string;
    "@_name": string;
}

function formatClassOperator(name: string, params: string, returnType: string, docs: string): string {
    return `${docs}\n${name}(${params}): ${returnType};\n`;
}

const OPERATOR_NAMES_MAP: Record<string, string> = {
    "operator !=": "neqgd",
    "operator *": "mulgd",
    "operator +": "addgd",
    "operator -": "subgd",
    "operator /": "divgd",
    "operator <": "ltgd",
    "operator <=": "ltegd",
    "operator ==": "eqgd",
    "operator >": "gtgd",
    "operator >=": "gtegd",
    "operator []": "getgd",
    "operator %": "modgd",
    "operator unary+": "posgd",
    "operator unary-": "neggd",
};

function parseOperatorName(name: string): string {
    if (name in OPERATOR_NAMES_MAP) {
        return OPERATOR_NAMES_MAP[name];
    } else {
        console.warn(`Unknown operator name: ${name}`);
        return name;
    }
}

function extractOperatorDetails(method: ClassOperator): { name: string, params: string, returnType: string, docs: string } {
    const docs = parseDocs(method.description);
    const name = parseOperatorName(method["@_name"]);
    const params = method.param?.map(parseFunctionParam).join('') || '';
    const returnType = gdTypeToTs(method.return?.["@_type"] || 'void');
    return { name, params, returnType, docs };
}

export function parseClassOperator(method: ClassOperator): string {
    const { name, params, returnType, docs } = extractOperatorDetails(method);
    return formatClassOperator(name, params, returnType, docs);
}

export default function parseClassOperators(methods: ClassOperator[]): string {
    return methods.map(parseClassOperator).join('\n');
}
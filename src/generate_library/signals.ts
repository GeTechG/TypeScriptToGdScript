import {type FunctionParam} from "./functions.js";
import parseDocs from "./docs.js";
import gdTypeToTs from "./types.js";

export interface ClassSignal {
    param?: FunctionParam[];
    description: string;
    "@_name": string;
}

function formatClassSignal(name: string, params: string, docs: string): string {
    return `${docs}\n${name}: Signal<[${params}]>;`;
}

export function parseClassSignal(method: ClassSignal): string {
    const docs = parseDocs(method.description);
    const name = method["@_name"];
    const params = method.param?.map(param => gdTypeToTs(param["@_type"])).join(', ') || '';
    return formatClassSignal(name, params, docs);
}

export default function parseClassSignals(methods: ClassSignal[]): string {
    return methods.map(parseClassSignal).join('\n');
}
import ParseContext from "./context.js";
import ts from "typescript";
import {bodyString} from "./utils.js";
import {NotEmptyStringFiltered} from "../utils.js";
import {parseNode} from "./index.js";

function formatMethod(name: string, parameters: string, body: string): string {
    return `func ${name}(${parameters}):\n${bodyString(body)}`;
}

export default function parseMethod(node: ts.MethodDeclaration, context: ParseContext) {
    const name = parseNode(node.name, context);
    const parameters = node.parameters.map(parameter => parseMethodParameter(parameter, context)).join(', ');

    context.method_stack.push({ method_name: name });
    const body = parseMethodBody(node, context);
    context.method_stack.pop();

    return formatMethod(name, parameters, body);
}

function parseMethodParameter(node: ts.ParameterDeclaration, context: ParseContext) {
    const name = parseNode(node.name, context);
    const type = node.type ? parseNode(node.type, context) : undefined;
    return `${name}: ${type}`;
}

function parseMethodBody(node: ts.MethodDeclaration, context: ParseContext) {
    return node.body?.statements
        .map(statement => parseNode(statement, context))
        .filter(NotEmptyStringFiltered)
        .join('\n') || '';
}
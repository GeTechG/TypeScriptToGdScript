import type ParseContext from "./context.ts";
import ts from "typescript";
import {bodyString, getLeadingComment, parseStatement} from "./utils.js";
import {parseNode} from "./index.js";

function formatMethod(name: string, parameters: string, body: string): string {
    return `func ${name}(${parameters}):\n${bodyString(body)}`;
}

function formatMethodParameter(name: string, type: string | undefined): string {
    return type ? `${name}: ${type}` : name;
}

export default function parseMethod(node: ts.MethodDeclaration, context: ParseContext) {
    const name = parseNode(node.name, context);
    const parameters = node.parameters
        .map(parameter => {
            const paramName = parseNode(parameter.name, context);
            const paramType = parameter.type ? parseNode(parameter.type, context) : undefined;
            return formatMethodParameter(paramName, paramType);
        })
        .join(', ');

    context.method_stack.push({ method_name: name });
    const body = node.body ? parseStatement(node.body, context) : '';
    context.method_stack.pop();

    const comment = getLeadingComment(node, context);

    return comment + formatMethod(name, parameters, body);
}
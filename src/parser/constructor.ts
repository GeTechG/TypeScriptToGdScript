import type ParseContext from "./context.ts";
import ts from "typescript";
import {bodyString, getLeadingComment, parseStatement} from "./utils.js";
import {parseNode} from "./index.js";
import {formatMethodParameter} from "./method.js";

function formatConstructor(parameters: string, body: string): string {
    return `func _init(${parameters}):\n${bodyString(body)}`;
}

export default function parseConstructor(node: ts.ConstructorDeclaration, context: ParseContext) {
    const setters: string[] = [];
    const classProperties = node.parameters
        .filter(parameter => parameter.modifiers?.some(modifier =>
            modifier.kind === ts.SyntaxKind.PrivateKeyword ||
            modifier.kind === ts.SyntaxKind.ReadonlyKeyword))
        .map(parameter => {
            const paramName = parseNode(parameter.name, context);
            const paramType = parameter.type ? parseNode(parameter.type, context) : undefined;
            setters.push(`self.${paramName} = ${paramName}`);
            return `var ${paramName}${paramType ? `: ${paramType}` : ''}`;
        })
        .join('\n');

    const parameters = node.parameters
        .map(parameter => {
            const paramName = parseNode(parameter.name, context);
            const paramType = parameter.type ? parseNode(parameter.type, context) : undefined;
            const initializer = parameter.initializer ? parseNode(parameter.initializer, context) : undefined;
            return formatMethodParameter(paramName, paramType, initializer);
        })
        .join(', ');

    context.method_stack.push({ method_name: '_init' });
    const body = setters.join('\n') + '\n' + (node.body ? parseStatement(node.body, context) : '');
    context.method_stack.pop();

    const comment = getLeadingComment(node, context);

    return `${classProperties}\n${comment}${formatConstructor(parameters, body)}`;
}
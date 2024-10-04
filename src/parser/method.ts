import type ParseContext from "./context.ts";
import ts from "typescript";
import {bodyString, getLeadingComment, parseStatement} from "./utils.js";
import {parseNode} from "./index.js";

function formatMethod(name: string, parameters: string, body: string): string {
    return `func ${name}(${parameters}):\n${bodyString(body)}`;
}

export function formatMethodParameter(name: string, type: string | undefined, initializer?: string): string {
    let out = name;
    if (type) {
        out += `: ${type}`;
    }
    if (initializer) {
        out += ` = ${initializer}`;
    }
    return out;
}

export default function parseMethod(node: ts.MethodDeclaration | ts.ArrowFunction | ts.FunctionDeclaration, context: ParseContext) {
    const isInLambdaSpace = context.method_stack.some(method => method.is_lambda);
    const isArrowFunction = node.kind === ts.SyntaxKind.ArrowFunction;
    const isStatic = node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.StaticKeyword);
    const name = node.name ? parseNode(node.name, context) : '';
    const parameters = node.parameters
        .map(parameter => {
            const paramName = parseNode(parameter.name, context);
            const paramType = parameter.type ? parseNode(parameter.type, context) : undefined;
            const initializer = parameter.initializer ? parseNode(parameter.initializer, context) : undefined;
            return formatMethodParameter(paramName, paramType, initializer);
        })
        .join(', ');

    if (isInLambdaSpace && !isArrowFunction) {
        context.lambdas_nodes.add(node);
    }

    context.method_stack.push({ method_name: name, is_lambda: node.kind === ts.SyntaxKind.ArrowFunction });
    const body = node.body ?
        node.body.kind === ts.SyntaxKind.Block ? parseStatement(node.body as ts.Block, context) : `${parseNode(node.body, context)}` :
        '';
    context.method_stack.pop();

    const comment = !isArrowFunction ? getLeadingComment(node, context) : '';
    const staticKeyword = isStatic || (node.kind === ts.SyntaxKind.FunctionDeclaration && !isInLambdaSpace) ? 'static ' : '';

    if (isInLambdaSpace && !isArrowFunction) {
        return `${comment}var ${name}\n${name} = ${staticKeyword}func (${parameters}):\n${bodyString(body)}`;
    }

    return comment + `${staticKeyword}${formatMethod(name, parameters, body)}`;
}
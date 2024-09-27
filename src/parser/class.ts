import ParseContext from "./context";
import ts from "typescript";
import {parseNode} from "./index";
import {bodyString} from "./utils";
import {NotEmptyStringFiltered} from "../utils";
import assert from "node:assert";

function formatClass(className: string, _extends: string | undefined, body: string): string {
    let result = `class ${className}`;
    if (_extends) {
        result += ` extends ${_extends}`;
    }
    result += ':\n' + bodyString(body);
    return result;
}

export default function parseClass(node: ts.ClassDeclaration, context: ParseContext) {
    const modifiers = node.modifiers || [];
    const isExported = modifiers.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword);
    const isDefault = modifiers.some(modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword);
    if (isExported && isDefault) {
        return parseScriptClass(node, context);
    } else {
        return parseInnerClass(node, context);
    }
}

function parseScriptClass(node: ts.ClassDeclaration, context: ParseContext) {
    const expression = node.heritageClauses?.[0]?.types?.[0]?.expression;
    const _extends = expression ? parseNode(expression, context) : undefined;
    const className = node.name ? parseNode(node.name, context) : undefined;
    context.class_name = className;
    context.extends = _extends;

    context.class_stack.push({ extends: _extends, class_name: className });
    const body = parseClassMembers(node, context);
    context.class_stack.pop();

    return body;
}

function parseInnerClass(node: ts.ClassDeclaration, context: ParseContext) {
    const expression = node.heritageClauses?.[0]?.types?.[0]?.expression;
    const _extends = expression ? parseNode(expression, context) : undefined;
    const className = node.name ? parseNode(node.name, context) : undefined;
    assert(className, 'Class name is required')

    context.class_stack.push({ extends: _extends, class_name: className });
    const body = parseClassMembers(node, context);
    context.class_stack.pop();

    return formatClass(className, _extends, body);
}

function parseClassMembers(node: ts.ClassDeclaration, context: ParseContext) {
    return node.members
        .map(member => parseNode(member, context))
        .filter(NotEmptyStringFiltered)
        .join('\n');
}
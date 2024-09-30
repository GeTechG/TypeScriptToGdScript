import type ParseContext from "./context.js";
import ts from "typescript";
import {parseNode} from "./index.js";
import {RENAME_FUNCTIONS} from "../generate_library/functions.js";

const CALL_EXPRESSION_MAP = new Map([
    ['console.log', 'prints']
]);

const UN_RENAME_MAP = Array.from(RENAME_FUNCTIONS.entries()).reduce((map, [key, value]) => {
    map.set(value, key);
    return map;
}, new Map<string, string>());

const OPERATOR_FORMATS: Record<string, string> = {
    "neq": "(a != b)",
    "mul": "(a * b)",
    "add": "(a + b)",
    "sub": "(a - b)",
    "div": "(a / b)",
    "lt": "(a < b)",
    "lte": "(a <= b)",
    "eq": "(a == b)",
    "gt": "(a > b)",
    "gte": "(a >= b)",
    "get": "a[b]",
    "mod": "(a % b)",
    "pos": "(+a)",
    "neg": "(-a)",
};

function formatCallExpression(expression: string, args: string): string {
    return `${expression}(${args})`;
}

function formatOperatorExpression(expression: string, args: string, operator: string): string {
    return OPERATOR_FORMATS[operator].replace('a', expression).replace('b', args);
}

export default function parseCallExpression(node: ts.CallExpression, context: ParseContext): string {
    const expression = parseCallExpressionExpression(node.expression, context);
    const args = node.arguments.map(arg => parseNode(arg, context)).join(', ');

    switch (expression) {
        case 'sn':
            return `&${args}`;
        case '$':
            return `$${args.slice(1, -1)}`;
    }

    const lastProperty = expression.split('.').pop();
    if (lastProperty && lastProperty in OPERATOR_FORMATS) {
        return formatOperatorExpression(expression.substring(0, expression.length - lastProperty.length - 1), args, lastProperty);
    }

    return formatCallExpression(expression, args);
}

function parseCallExpressionExpression(expression: ts.LeftHandSideExpression, context: ParseContext): string {
    const expressionStr = expression.getText();
    return CALL_EXPRESSION_MAP.get(expressionStr)
        || UN_RENAME_MAP.get(expressionStr)
        || parseNode(expression, context);
}
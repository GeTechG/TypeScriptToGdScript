import ParseContext from "./context.js";
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

function formatCallExpression(expression: string, args: string): string {
    return `${expression}(${args})`;
}

export default function parseCallExpression(node: ts.CallExpression, context: ParseContext): string {
    const expression = parseCallExpressionExpression(node.expression, context);
    const args = node.arguments.map(arg => parseNode(arg, context)).join(', ');
    return formatCallExpression(expression, args);
}

function parseCallExpressionExpression(expression: ts.LeftHandSideExpression, context: ParseContext): string {
    const expressionStr = expression.getText();
    return CALL_EXPRESSION_MAP.get(expressionStr)
        || UN_RENAME_MAP.get(expressionStr)
        || parseNode(expression, context);
}
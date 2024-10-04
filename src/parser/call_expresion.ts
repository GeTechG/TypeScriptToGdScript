import type ParseContext from "./context.js";
import ts from "typescript";
import {parseNode} from "./index.js";
import {RENAME_FUNCTIONS} from "../generate_library/functions.js";
import {getDeclarationNode} from "./utils.js";

const CALL_EXPRESSION_MAP = new Map([
    ['console.log', 'prints']
]);

const UN_RENAME_MAP = Array.from(RENAME_FUNCTIONS.entries()).reduce((map, [key, value]) => {
    map.set(value, key);
    return map;
}, new Map<string, string>());

const OPERATOR_FORMATS: Record<string, string> = {
    "neqgd": "(a != b)",
    "mulgd": "(a * b)",
    "addgd": "(a + b)",
    "subgd": "(a - b)",
    "divgd": "(a / b)",
    "ltgd": "(a < b)",
    "ltegd": "(a <= b)",
    "eqgd": "(a == b)",
    "gtgd": "(a > b)",
    "gtegd": "(a >= b)",
    "getgd": "a[b]",
    "modgd": "(a % b)",
    "posgd": "(+a)",
    "neggd": "(-a)",
};

function formatCallExpression(expression: string, args: string): string {
    return `${expression}(${args})`;
}

function formatCallExpressionCallable(expression: string, args: string): string {
    return `${expression}.call(${args})`;
}

function formatOperatorExpression(expression: string, args: string, operator: string): string {
    return OPERATOR_FORMATS[operator].replace('a', expression).replace('b', args);
}

export default function parseCallExpression(node: ts.CallExpression, context: ParseContext): string {
    const declarationExpression = getDeclarationNode(node.expression, context.program);
    const isSetLambda = declarationExpression && context.lambdas_nodes.has(declarationExpression);
    const isParameter = declarationExpression && ts.isParameter(declarationExpression);
    const isImport = declarationExpression && ts.isImportSpecifier(declarationExpression);

    const isArrowFunctionCall = (
        declarationExpression &&
        ts.isPropertyDeclaration(declarationExpression) &&
        declarationExpression.initializer &&
        ts.isArrowFunction(declarationExpression.initializer)
    ) || isSetLambda || isParameter || isImport;

    const declarationExpressionParent = ts.isPropertyAccessExpression(node.expression)
        ? getDeclarationNode(node.expression.expression, context.program)
        : undefined;

    const isArray = declarationExpressionParent &&
        (ts.isPropertyDeclaration(declarationExpressionParent) || ts.isParameter(declarationExpressionParent) || ts.isVariableDeclaration(declarationExpressionParent)) &&
        declarationExpressionParent.type &&
        (
            ts.isArrayTypeNode(declarationExpressionParent.type) ||
            (
                ts.isUnionTypeNode(declarationExpressionParent.type) &&
                declarationExpressionParent.type.types.some(type => ts.isArrayTypeNode(type))
            )
        );

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

    if (isArrowFunctionCall) {
        return formatCallExpressionCallable(expression, args);
    }

    if (isArray) {
        switch (lastProperty) {
            case 'splice':
                return `ArrayUtils.splice(${expression.slice(0, -7)}, ${args})`;
            case 'forEach':
                return `ArrayUtils.forEach(${expression.slice(0, -8)}, ${args})`;
            case 'concat':
                return `ArrayUtils.concat(${expression.slice(0, -7)}, ${args})`;
            case 'flatMap':
                return `ArrayUtils.flatMap(${expression.slice(0, -8)}, ${args})`;
        }
    }

    return formatCallExpression(expression, args);
}

function parseCallExpressionExpression(expression: ts.LeftHandSideExpression, context: ParseContext): string {
    const expressionStr = expression.getText();
    return CALL_EXPRESSION_MAP.get(expressionStr)
        || UN_RENAME_MAP.get(expressionStr)
        || parseNode(expression, context);
}
import ParseContext from "./context.js";
import ts from "typescript";
import {parseNode} from "./index.js";

export default function parseBinaryExpression(node: ts.BinaryExpression, context: ParseContext) {
    const left = parseNode(node.left, context);
    const right = parseNode(node.right, context);
    let operator: string;
    switch (node.operatorToken.kind) {
        case ts.SyntaxKind.InstanceOfKeyword:
            operator = 'is';
            break;
        case ts.SyntaxKind.ExclamationEqualsEqualsToken:
            operator = '!=';
            break;
        case ts.SyntaxKind.EqualsEqualsEqualsToken:
            operator = '==';
            break;
        default:
            operator = node.operatorToken.getText();
            break;
    }

    if (operator === '=' && right === '0' && left.endsWith('.size()')) {
        const arrayName = left.slice(0, -7); // Remove ".length" from the end
        return `${arrayName}.clear()`;
    }

    return `${left} ${operator} ${right}`;
}
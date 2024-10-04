import ParseContext from "./context.js";
import ts from "typescript";
import {parseNode} from "./index.js";
import {bodyString, parseStatement} from "./utils.js";

export default function parseForStatement(node: ts.ForStatement, context: ParseContext) {
    let output = '';
    const initializer = node.initializer ? parseNode(node.initializer, context) : undefined;
    if (initializer) {
        output += `${initializer}\n`;
    }

    const condition = node.condition ? parseNode(node.condition, context) : '';
    const incrementor = node.incrementor ? parseNode(node.incrementor, context) : '';
    const body = ts.isBlock(node.statement) ? parseStatement(node.statement, context) : `return ${parseNode(node.statement, context)}`;

    output += `while ${condition}:\n${bodyString(body + '\n' + incrementor)}`;

    return `if true:\n${bodyString(output)}`;
}
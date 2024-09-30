import ParseContext from "./context.js";
import ts from "typescript";
import {parseNode} from "./index.js";
import {bodyString, getLeadingComment, parseStatement} from "./utils.js";

function formatIfStatement(condition: string, thenStatement: string, elseStatement?: string): string {
    return `if ${condition}:\n${bodyString(thenStatement)}${elseStatement ? `\nelse:\n${bodyString(elseStatement)}` : ''}`;
}

export default function parseIfStatement(node: ts.IfStatement, context: ParseContext): string {
    const condition = parseNode(node.expression, context);
    const thenStatement = parseStatement(node.thenStatement, context);
    const elseStatement = node.elseStatement ? parseStatement(node.elseStatement, context) : undefined;

    const comment = getLeadingComment(node, context);

    return comment + formatIfStatement(condition, thenStatement, elseStatement);
}
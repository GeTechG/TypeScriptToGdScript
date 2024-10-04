import type ParseContext from "./context.ts";
import ts from "typescript";
import { bodyString, getLeadingComment, parseStatement } from "./utils.js";
import { parseNode } from "./index.js";

function formatForOfStatement(initializer: string, expression: string, statement: string): string {
    return `for ${initializer} in ${expression}:\n${bodyString(statement)}`;
}

export default function parseForOfStatement(node: ts.ForOfStatement, context: ParseContext) {
    const initializer = ts.isVariableDeclarationList(node.initializer) ?
        node.initializer.declarations.map(declaration => parseNode(declaration.name, context)).join(', ') :
        parseNode(node.initializer, context);
    const expression = parseNode(node.expression, context);
    const statement = parseStatement(node.statement, context);

    const comment = getLeadingComment(node, context);

    return comment + formatForOfStatement(initializer, expression, statement);
}
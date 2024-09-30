import type ParseContext from "./context.js";
import ts from "typescript";
import {parseNode} from "./index.js";
import {getLeadingComment} from "./utils.js";

interface VariableDeclarationFormatOptions {
    leadingComment: string;
    isConst: boolean;
    name: string;
    type?: string;
    initializer?: string;
}

function formatVariableDeclaration(options: VariableDeclarationFormatOptions): string {
    let output = options.leadingComment;
    output += options.isConst ? 'const ' : 'var ';
    output += options.name;
    if (options.type) {
        output += `: ${options.type}`;
    }
    if (options.initializer) {
        output += ` = ${options.initializer}`;
    }
    return output;
}

export default function parseVariableDeclaration(node: ts.VariableDeclaration, context: ParseContext): string {
    const leadingComment = getLeadingComment(node, context);
    const name = parseNode(node.name, context);
    const type = node.type ? parseNode(node.type, context) : undefined;
    const initializer = node.initializer ? parseNode(node.initializer, context) : undefined;
    const isConst = context.const_counter > 0;

    return formatVariableDeclaration({
        leadingComment,
        isConst,
        name,
        type,
        initializer
    });
}
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

function formatVariableDeclaration(options: VariableDeclarationFormatOptions, context: ParseContext): string {
    let output = options.leadingComment;
    output += options.isConst ? 'const ' : 'var ';
    output += options.name;
    if (options.type) {
        output += `: ${options.type}`;
    }
    if (options.initializer) {
        if (options.isConst || context.method_stack.length === 0) {
            output += ` = ${options.initializer}`;
        } else {
            output += `\n${options.name} = ${options.initializer}`;
        }
    }
    return output;
}

export default function parseVariableDeclaration(node: ts.VariableDeclaration, context: ParseContext): string {
    const leadingComment = getLeadingComment(node, context);
    const name = parseNode(node.name, context);
    const type = node.type ? parseNode(node.type, context) : undefined;
    const initializer = node.initializer ? parseNode(node.initializer, context) : undefined;
    const iSimpleType = (node.initializer && node.initializer?.kind !== ts.SyntaxKind.ArrowFunction &&
        !ts.isExpression(node.initializer)) || false;
    const isConst = context.const_counter > 0 && iSimpleType;

    return formatVariableDeclaration({
        leadingComment,
        isConst,
        name,
        type,
        initializer
    }, context);
}
import type ParseContext from "./context.js";
import ts from "typescript";
import {parseNode} from "./index.js";
import {getLeadingComment, getTrailingComment} from "./utils.js";

interface PropertyDeclarationFormatOptions {
    isConst: boolean;
    name: string;
    _type?: string;
    initializer?: string;
    annotations?: string;
    leadingComment: string;
    trailingComment: string;
}

function formatPropertyDeclaration(options: PropertyDeclarationFormatOptions): string {
    let output = options.leadingComment;

    if (options.annotations) {
        output += options.annotations + ' ';
    }

    output += (options.isConst ? 'const ' : 'var ') + options.name;
    if (options._type) {
        output += `: ${options._type}`;
    }
    if (options.initializer) {
        output += ` = ${options.initializer}`;
    }

    output += options.trailingComment;

    return output;
}

function formatSignalDeclaration(name: string, types: string | undefined, trailingComment: string): string {
    let output = `signal ${name}`;
    if (types) {
        output += `(${types})`;
    }

    output += trailingComment;

    return output;
}

export default function parsePropertyDeclaration(node: ts.PropertyDeclaration, context: ParseContext) {
    if (node.type && ts.isTypeReferenceNode(node.type)) {
        const typeName = node.type.typeName.getText();
        if (typeName === 'Signal') {
            return parseSignalDeclaration(node, context);
        }
    }

    const leadingComment = getLeadingComment(node, context);

    const annotations = node.modifiers
        ?.filter(modifier => modifier.kind === ts.SyntaxKind.Decorator)
        .map(decorator => parseNode(decorator, context))
        .join(' ');

    const name = parseNode(node.name, context);
    const _type = node.type ? parseNode(node.type, context) : undefined;
    const isConst = node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ReadonlyKeyword) || false;
    const initializer = node.initializer ? parseNode(node.initializer, context) : undefined;
    const trailingComment = getTrailingComment(node);

    return formatPropertyDeclaration({
        isConst,
        name,
        _type,
        initializer,
        annotations,
        leadingComment,
        trailingComment
    });
}

function parseSignalDeclaration(node: ts.PropertyDeclaration, context: ParseContext) {
    const name = parseNode(node.name, context);
    const types = ((node.type as ts.TypeReferenceNode | undefined)?.typeArguments?.[0] as ts.TupleTypeNode | undefined)?.elements
        .map((type, i) => 'arg' + i + ': ' + parseNode(type, context))
        .join(', ');
    const trailingComment = getTrailingComment(node);

    return formatSignalDeclaration(name, types, trailingComment);
}

import ts from "typescript";
import ParseContext from "./context.js";
import path from "node:path";
import {parseNode} from "./index.js";
import {NotEmptyStringFiltered} from "../utils.js";

export function bodyString(content: string): string {
    if (!content || content.trim() === '') {
        return '\tpass';
    }
    return indentContent(content);
}

function indentContent(content: string): string {
    return content
        .split('\n')
        .map(line => `\t${line}`)
        .join('\n');
}

export function parseStatement(node: ts.Statement, context: ParseContext): string {
    const statements = getStatements(node);
    return formatStatements(statements, context);
}

function getStatements(node: ts.Statement): ts.Statement[] {
    return node.kind === ts.SyntaxKind.Block ? [...(node as ts.Block).statements] : [node];
}

function formatStatements(statements: ts.Statement[], context: ParseContext): string {
    return statements
        .map(statement => parseNode(statement, context))
        .filter(NotEmptyStringFiltered)
        .join('\n') || '';
}

export function backtrace(node: ts.Node, context: ParseContext): string {
    const pos = getNodePosition(node);
    const filePath = getRelativeFilePath(node, context);
    return `${filePath}:${pos.line + 1}:${pos.character + 1}`;
}

function getNodePosition(node: ts.Node): ts.LineAndCharacter {
    return node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
}

function getRelativeFilePath(node: ts.Node, context: ParseContext): string {
    return path.relative(context.project_path, node.getSourceFile().fileName);
}

export function getTrailingComment(node: ts.Node): string {
    const trailingCommentRanges = ts.getTrailingCommentRanges(node.getSourceFile().getFullText(), node.getFullStart() + node.getFullWidth());
    return ' ' + (trailingCommentRanges ? formatTrailingComments(trailingCommentRanges, node) : '');
}

function formatTrailingComments(ranges: ts.CommentRange[], node: ts.Node): string {
    return ranges
        .map(range => formatCommentRange(range, node))
        .join('\n');
}

function formatCommentRange(range: ts.CommentRange, node: ts.Node): string {
    const comment = node.getSourceFile().getFullText().substring(range.pos, range.end);
    return comment.trim().replace(/^\/\//, '#').replace(/^\/\*+/, '#').replace(/\*+\//, '') + (range.hasTrailingNewLine ? '\n' : '');
}

export function getLeadingComment(node: ts.Node, context: ParseContext): string {
    const leadingCommentRanges = ts.getLeadingCommentRanges(node.getSourceFile().getFullText(), node.getFullStart());
    return formatLeadingComments(leadingCommentRanges, node, context);
}

function formatLeadingComments(ranges: ts.CommentRange[] | undefined, node: ts.Node, context: ParseContext): string {
    let output = `# ${backtrace(node, context)}\n`;
    if (ranges) {
        output += ranges
            .map(range => formatCommentRange(range, node))
            .join('\n') + '\n';
    }
    return output;
}
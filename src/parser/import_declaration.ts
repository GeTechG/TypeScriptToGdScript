import type ParseContext from "./context.js";
import ts from "typescript";
import path from "node:path";
import {parseNode} from "./index.js";

function formatImportDefault(name: string, godotPath: string): string {
    return `const ${name} = preload('${godotPath}');`;
}

function formatImportNamed(name: string, alias: string, godotPath: string): string {
    return `const ${alias} = preload('${godotPath}').${name};`;
}

export default function parseImportDeclaration(node: ts.ImportDeclaration, context: ParseContext): string {
    let output = '';

    const moduleSpecifier = parseNode(node.moduleSpecifier, context);
    if (moduleSpecifier == "\"godot\"") {
        return output;
    }
    const godotPath = `res://${path.relative(context.project_path, context.out_directory) + moduleSpecifier.slice(2, -1)}.gd`;

    if (node.importClause?.name) {
        output += formatImportDefault(node.importClause.name.text, godotPath);
    }
    if (node.importClause?.namedBindings?.kind === ts.SyntaxKind.NamedImports) {
        const namedImports = node.importClause.namedBindings as ts.NamedImports;
        output += namedImports.elements.map(namedImport => {
            const name = parseNode(namedImport.name, context);
            const alias = namedImport.propertyName ? parseNode(namedImport.propertyName, context) : name;
            return formatImportNamed(name, alias, godotPath);
        }).join('\n');
    }

    return output;
}
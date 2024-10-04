import ParseContext from "./context.js";
import ts from "typescript";
import {getDeclarationNode, getImportType} from "./utils.js";

export default function parseIdentifier(node: ts.Identifier, context: ParseContext) {
    const declaration = getDeclarationNode(node, context.program);
    const isTypeParameter = declaration && ts.isTypeParameterDeclaration(declaration);
    const declaration_import = getImportType(node, context.program);
    if ((declaration_import && ts.isTypeAliasDeclaration(declaration_import)) || (declaration && ts.isTypeAliasDeclaration(declaration))) {
        return 'Variant';
    }
    let text = (node as ts.Identifier).text;
    switch (text) {
        case '_':
            text = `_a`;
            break;
        case 'undefined':
            text = 'null';
            break;
        case 'Set':
            context.features.Set = true;
    }
    if (isTypeParameter) {
        text = 'Variant';
    }
    return text;
}
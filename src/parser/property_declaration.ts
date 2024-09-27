import ParseContext from "./context";
import ts from "typescript";
import {parseNode} from "./index";

export default function parsePropertyDeclaration(node: ts.PropertyDeclaration, context: ParseContext) {
    const name = parseNode(node.name, context);
    if (node.initializer) {
        return `var ${name} = ${parseNode(node.initializer, context)}`;
    }
    return `var ${name}`
}
import type ParseContext from "./context.js";
import ts from "typescript";
import {parseNode} from "./index.js";
import {NotEmptyStringFiltered} from "../utils.js";

export default function parseVariableStatement(node: ts.VariableStatement, context: ParseContext) {
    const declarationList = (node as ts.VariableStatement).declarationList;
    const isConst = (declarationList.flags & ts.NodeFlags.Const) !== 0;
    if (isConst) {
        context.const_counter++;
    }
    const declarations = declarationList.declarations
        .map(declaration => parseNode(declaration, context))
        .filter(NotEmptyStringFiltered)
        .join('\n');
    if (isConst) {
        context.const_counter--;
    }
    return declarations;
}
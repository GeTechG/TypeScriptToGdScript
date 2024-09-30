import {XMLParser} from "fast-xml-parser";
import parseDocs from "./docs.js";
import path from "node:path";
import {getAllFiles} from "../utils.js";
import fs from "node:fs";
import synchronizedPrettier from "@prettier/sync";
import parseFunctions from "./functions.js";
import parseClassMethods, {type ClassMethod} from "./methods.js";
import parseClassMembers, {type ClassMember} from "./members.js";
import parseSingletons from "./singletons.js";
import parseClassAnnotations, {ClassAnnotation} from "./annotations.js";
import parseClassOperators, {ClassOperator} from "./operators.js";
import parseClassConstants, {ClassConstant} from "./class_constants.js";
import parseClassConstructors, {ClassConstructor} from "./constructors.js";
import config, {projectPath} from "../config.js";
import signletons from "../data/singletons.json" assert {type: "json"};
import parseClassSignals, {ClassSignal} from "./signals.js";

const CLASSES_PATH = 'doc/classes';
const GDSCRIPT_PATH = 'modules/gdscript/doc_classes';
const SKIP_CLASSES = ['Signal', 'float', 'int', 'bool'];

const parser = new XMLParser({
    ignoreAttributes: false,
    isArray: (tagName) => {
        return ['method', 'param', 'member', 'constant', 'operator', 'signal'].includes(tagName);
    }
});

interface XmlClassData {
    description: string;
    constructors?: { constructor: ClassConstructor[] };
    signals?: { signal: ClassSignal[] };
    methods?: { method: ClassMethod[] };
    members?: { member: ClassMember[] };
    annotations?: { annotation: ClassAnnotation[] };
    constants?: { constant: ClassConstant[] };
    operators?: { operator: ClassOperator[] };
    "@_name": string;
    "@_inherits"?: string;
}

function formatClassOutput(name: string, description: string, inherits: string | undefined, content: string): string {
    let output = `declare module "godot" {\n`;
    if (!name.startsWith("@")) {
        output += `${parseDocs(description)}\n`;
        output += `export class ${name}`;
        if (inherits) {
            output += ` extends ${inherits}`;
        }
        output += ' {\n';
    }
    output += content;
    if (!name.startsWith("@")) {
        output += '}\n';
    }
    output += '}';
    return synchronizedPrettier.format(output, { parser: 'typescript' });
}

export default function generateClasses(godotSourceDir: string) {
    const fullClassesPath = path.join(godotSourceDir, CLASSES_PATH);
    const fullGdscriptPath = path.join(godotSourceDir, GDSCRIPT_PATH);

    const classFiles = getAllFiles(fullClassesPath, '.xml');
    const gdscriptFiles = getAllFiles(fullGdscriptPath, '.xml');

    const allFiles = [...classFiles, ...gdscriptFiles].filter(file =>
        !SKIP_CLASSES.includes(path.basename(file, '.xml'))
    );

    const dataClasses: string[] = [];

    const pairsFiles = allFiles.map(file => {
        const xmlContent = fs.readFileSync(file, 'utf-8');
        const parsedContent = parser.parse(xmlContent).class as XmlClassData;
        const name = parsedContent["@_name"];
        const isGlobalScope = name.startsWith("@");

        if (signletons.includes(name)) {
            parsedContent["@_name"] += '_';
        }

        let content = '';
        const constructors = parsedContent.constructors?.constructor || [];
        const signals = parsedContent.signals?.signal || [];
        let members = parsedContent.members?.member || [];
        const methods = parsedContent.methods?.method || [];
        const annotations = parsedContent.annotations?.annotation || [];
        const constants = parsedContent.constants?.constant || [];
        const operators = parsedContent.operators?.operator || [];

        if (name === '@GlobalScope') {
            if (config?.debug) {
                const singletonNames = members.map(member => member["@_name"]);
                fs.writeFileSync(projectPath + '/singletons.json', JSON.stringify(singletonNames, null, 2));
            }
            members = members.map(member => {
                member["@_type"] += '_';
                return member;
            });
        }

        if (config?.debug && !isGlobalScope && parsedContent["@_inherits"] === undefined) {
            dataClasses.push(name);
        }

        if (isGlobalScope) {
            content += parseSingletons(members);
            content += parseFunctions(methods);
            content += parseClassAnnotations(annotations);
        } else {
            content += parseClassConstructors(constructors);
            content += parseClassSignals(signals);
            content += parseClassConstants(constants);
            content += parseClassMembers(members);
            content += parseClassMethods(methods);
            content += parseClassOperators(operators);
        }

        return [name, formatClassOutput(parsedContent["@_name"], parsedContent.description, parsedContent["@_inherits"], content)];
    });

    if (config?.debug) {
        fs.writeFileSync(projectPath + '/data_classes.json', JSON.stringify(dataClasses, null, 2));
    }

    return pairsFiles;
}
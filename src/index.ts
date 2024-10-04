#!/usr/bin/env node

import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import init from "./init.js";
import parse, {ParseOptions} from './parser/index.js';
import * as path from "path";
import {getAllFiles} from "./utils.js";
import generateLibrary from "./generate_library/index.js";
import * as fs from "node:fs";
import config, {projectPath} from "./config.js";
import ts from "typescript";
import {FeaturesCollectionsContext} from "./parser/context.js";

yargs(hideBin(process.argv))
    .command('init', 'Initialize a new project',
        () => {
        },
        async () => {
            await init(process.cwd());
        })
    .command('lib <godot_src>', 'Generate library from Godot source', (yargs) => {
        yargs.positional('godot_src', {
            describe: 'Godot source directory',
            type: 'string'
        });
    }, (argv) => {
        const libraries = generateLibrary((argv.godot_src as string));
        for (const [name, content] of libraries) {
            const godotPath = path.join(projectPath, 'types', 'godot');
            if (!fs.existsSync(godotPath)) {
                fs.mkdirSync(godotPath, {recursive: true});
            }
            fs.writeFileSync(path.join(godotPath, name + '.d.ts'), content);
        }
    })
    .command("*", 'parse', () => {}, () => {
        console.assert(config !== undefined, 'Configuration file not found');
        const scriptsDirectory = path.join(projectPath, (config!.src));
        const outDirectory = path.join(projectPath, (config!.out));
        const tsFiles = getAllFiles(scriptsDirectory);
        const featuresFiles = getAllFiles(path.join(import.meta.dirname, 'extends_collections'));
        const program = ts.createProgram([...tsFiles, ...featuresFiles], {
            target: ts.ScriptTarget.Latest,
        }, ts.createCompilerHost({
            target: ts.ScriptTarget.Latest,
        }, true));
        const features: FeaturesCollectionsContext = {
            Set: false,
            ArrayUtils: false,
        }
        const parsedFiles = tsFiles.map(tsFile => {
            const options: ParseOptions = {
                source: program.getSourceFile(tsFile)!,
                program,
                features,
                scriptsDirectory: outDirectory,
                projectPath,
                scriptPath: path.relative(scriptsDirectory, tsFile)
            };
            return [tsFile, parse(options)];
        });
        for (const feature in features) {
            if (features[feature as keyof FeaturesCollectionsContext]) {
                switch (feature) {
                    case 'Set':
                        features.ArrayUtils = true;
                        break;
                }
            }
        }
        for (const feature in features) {
            if (features[feature as keyof FeaturesCollectionsContext]) {
                const _path = path.join(import.meta.dirname, 'extends_collections', feature + '.ts');
                const parsed = parse({
                    source: program.getSourceFile(_path)!,
                    program,
                    features,
                    scriptsDirectory: outDirectory,
                    projectPath,
                    scriptPath: path.join('extends_collections', feature + '.ts')
                });
                parsedFiles.push([path.join(outDirectory, 'extends_collections', feature + '.ts'), parsed]);
            }
        }
        for (const [tsFile, content] of parsedFiles) {
            const localPath = path
                .relative(scriptsDirectory, tsFile)
                .replace(/\.ts$/, '.gd');
            const outFile = path.join(projectPath, (config!.out), localPath);

            const outDir = path.dirname(outFile);
            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, {recursive: true});
            }

            fs.writeFileSync(outFile, content);
        }
    })
    .parse();
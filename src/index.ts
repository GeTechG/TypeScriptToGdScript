#!/usr/bin/env node

import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import init from "./init.js";
import parse from './parser/index.js';
import * as path from "path";
import {getAllFiles} from "./utils.js";
import generateLibrary from "./generate_library/index.js";
import * as fs from "node:fs";
import config, {projectPath} from "./config.js";

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
        const parsedFiles = tsFiles.map(tsFile => [tsFile, parse(tsFile, outDirectory, projectPath)]);
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
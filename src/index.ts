#!/usr/bin/env node

import yargs from 'yargs/yargs';
import {hideBin} from 'yargs/helpers';
import init from "./init";
import parse from './parser';
import path from "node:path";
import {getAllFiles} from "./utils";
import generateLibrary from "./generate_library";
import * as fs from "node:fs";

const projectPath = process.env.PROJECT_PATH || process.cwd();

yargs(hideBin(process.argv))
    .config({
        extends: path.join(projectPath, 'tstgd.json'),
    })
    .command('init', 'Initialize a new project',
        () => {
        },
        () => {
            init(process.cwd());
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
    .command("*", 'parse', () => {}, (argv) => {
        const scriptsDirectory = path.join(projectPath, (argv.src as string));
        const tsFiles = getAllFiles(scriptsDirectory);
        const parsedFiles = tsFiles.map(tsFile => [tsFile, parse(tsFile)]);
        for (const [tsFile, content] of parsedFiles) {
            const localPath = path
                .relative(scriptsDirectory, tsFile)
                .replace(/\.ts$/, '.gd');
            const outFile = path.join(projectPath, (argv.out as string), localPath);

            const outDir = path.dirname(outFile);
            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, {recursive: true});
            }

            fs.writeFileSync(outFile, content);
        }
    })
    .parse();
#!/usr/bin/env node

import yargs from 'yargs/yargs'
import {hideBin} from 'yargs/helpers'
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
        (yargs) => {
        },
        (argv) => {
            init(process.cwd())
        })
    .command('lib <godot_src>', 'Generate library from Godot source', (yargs) => {
        yargs.positional('godot_src', {
            describe: 'Godot source directory',
            type: 'string'
        });
    }, (argv) => {
        let libraries = generateLibrary((<string>argv.godot_src));
        for (let [name, content] of libraries) {
            let godotPath = path.join(projectPath, 'types', 'godot');
            if (!fs.existsSync(godotPath)) {
                fs.mkdirSync(godotPath, {recursive: true});
            }
            fs.writeFileSync(path.join(godotPath, name + '.d.ts'), content);
        }
    })
    .command("*", 'parse', (yargs) => {
    }, (argv) => {
        let scriptsDirectory = path.join(projectPath, <string>argv.src);
        let tsFiles = getAllFiles(scriptsDirectory);
        let parsedFiles = tsFiles.map(tsFile => [tsFile, parse(tsFile)]);
        for (let [tsFile, content] of parsedFiles) {
            let localPath = path
                .relative(scriptsDirectory, tsFile)
                .replace(/\.ts$/, '.gd');
            let outFile = path.join(projectPath, <string>argv.out, localPath);

            let outDir = path.dirname(outFile);
            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, {recursive: true});
            }

            fs.writeFileSync(outFile, content);
        }
    })
    .parse()
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
                fs.mkdirSync(godotPath, { recursive: true });
            }
            fs.writeFileSync(path.join(godotPath, name + '.d.ts'), content);
        }
    })
    .command("*", 'parse', (yargs) => {
    }, (argv) => {
        let scriptsDirectory = path.join(projectPath, <string>argv.src);
        let tsFiles = getAllFiles(scriptsDirectory);
        tsFiles.forEach(tsFile => parse(tsFile));
    })
    .parse()
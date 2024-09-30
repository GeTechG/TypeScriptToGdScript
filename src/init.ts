import * as path from "path";
import * as fs from "node:fs";
import {CONFIG_FILE_NAME} from "./constants.js";
import {execa} from "execa";

export default async function init(directory: string) {
    console.log('Initializing new project in', directory);
    const {stdout} = await execa`npm init -y`
        .pipe`npm install --save-dev typescript`
        .pipe`npx tsc --init`;
    console.log(stdout);
    fs.writeFileSync(path.join(directory, 'tsconfig.json'), JSON.stringify({
        "compilerOptions": {
            "rootDir": "./src",
            "experimentalDecorators": true
        }
    }, null, 2));
    createConfigFile(directory, './src/', './dist/');
    fs.mkdirSync(path.join(directory, 'src'), {recursive: true});
    fs.mkdirSync(path.join(directory, 'dist'), {recursive: true});
    fs.appendFileSync(path.join(directory, '.gdignore'), '\nsrc/\nnode_modules/\n');
}

function createConfigFile(directory: string, srcDir: string, outDir: string) {
    const config = {
        src: srcDir,
        out: outDir
    };

    const configPath = path.join(directory, CONFIG_FILE_NAME);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('Configuration file created!');
}
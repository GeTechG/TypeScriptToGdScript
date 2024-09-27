import path from "node:path";
import * as fs from "node:fs";
import {CONFIG_FILE_NAME} from "./constants";

export default function init(directory: string) {
    console.log('Initializing new project in', directory)
    createConfigFile(directory, './src/', './dist/');
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
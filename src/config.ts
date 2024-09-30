import path from "path";
import fs from "node:fs";

export interface Config {
    src: string;
    out: string;
    debug?: boolean;
}

export const projectPath = process.env.PROJECT_PATH || process.cwd();
export const configPath = path.join(projectPath, 'tstgd.json');
const config: Config | undefined = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf-8')) : undefined;

export default config;
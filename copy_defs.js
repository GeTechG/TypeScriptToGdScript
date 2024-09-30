import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'jsonc-parser';

// Read tsconfig.json
const tsconfigPath = path.resolve('tsconfig.json');
const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8');
const tsconfig = parse(tsconfigContent);

// Get the outDir from tsconfig.json
const outDir = path.join(tsconfig.compilerOptions.outDir, 'generate_library');

// Define source and destination directories
const srcDir = path.resolve('src/generate_library/declarations');
const destDir = path.resolve(outDir);

// Function to copy files recursively
function copyFiles(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyFiles(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Copy files from srcDir to destDir
copyFiles(srcDir, destDir);
import gulp from 'gulp';
import rename from 'gulp-rename';
import path from 'path';
import fs from 'fs';
import transform from '../plugins/transform.mjs';
import pug from '../plugins/pug.mjs';
import { fileURLToPath } from 'url';
import { watch } from 'node:fs';

const { src, dest } = gulp;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pathToPublic = path.join(__dirname, '../public/');
const pathToDocs = path.join(__dirname, '../docs/');
const pathToBuild = path.join(__dirname, '../build/');
const filePaths = fs.readdirSync(pathToDocs).map((fileName) => {
    return path.join(pathToDocs, fileName);
});

function copyFileToFolder(sourcePath, targetFolder, callback) {
    fs.mkdir(targetFolder, { recursive: true }, (err) => {
        if (err) {
            throw err;
        }

        const fileName = path.basename(sourcePath);
        const targetPath = path.join(targetFolder, fileName);

        fs.copyFile(sourcePath, targetPath, (copyErr) => {
            if (copyErr) {
                throw copyErr;
            }
        });
    });
}

function buildFile(filePath) {
    src(filePath)
        .pipe(transform())
        .pipe(pug())
        .pipe(rename({ extname: '.html' }))
        .pipe(dest('build/', { overwrite: true }));
}

export function watchMarkdownFiles() {
    watch(pathToDocs, (eventType, fileName) => {
        if (eventType === 'change') {
            console.log('File changed: ', fileName);
            console.log('Build again....');
            buildFile(path.join(pathToDocs, fileName));
        }
    });
}

export function watchPublicFolder(folderName) {
    const pathToWatchingFolder = path.join(pathToPublic, folderName);
    const pathToBuildFolder = path.join(pathToBuild, folderName);

    watch(pathToWatchingFolder, (eventType, fileName) => {
        if (eventType === 'change') {
            console.log('Image changed: ', fileName);
            console.log('Copy again....');
            copyFileToFolder(path.join(pathToWatchingFolder, fileName), pathToBuildFolder);
        }
    });
}

export default function dev(callback) {
    filePaths.forEach(buildFile);
    src('public/**/*').pipe(dest('build/', { overwrite: true }));
    callback();
}

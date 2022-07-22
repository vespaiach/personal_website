const path = require('path');
const puppeteer = require('puppeteer');
const { opendir } = require('fs/promises');

const getFilenames = async () => {
    const imagesDirectory = path.join(process.cwd(), 'docs');
    const dir = await opendir(imagesDirectory);
    const files = [];

    for await (const dirent of dir) {
        if (dirent.isFile) {
            files.push(path.parse(dirent.name).name);
        }
    }

    return files;
};

const getImageNames = async () => {
    const imagesDirectory = path.join(process.cwd(), 'public', 'images');
    const dir = await opendir(imagesDirectory);
    const files = {};

    for await (const dirent of dir) {
        if (dirent.isFile) {
            files[path.parse(dirent.name).name] = true;
        }
    }

    return files;
};

// Takes a screenshot of an area within the page
const capture = async (url, name) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 1024, height: 1366 });
    await page.goto(url);
    await page.waitForSelector('title');

    await page.screenshot({
        path: `public/images/${name}.jpg`,
        type: 'jpeg',
        quality: 100,
        clip: { x: 0, y: 0, width: 1024, height: 1366 },
    });

    await browser.close();
};

(async () => {
    const [files, images] = await Promise.all([getFilenames(), getImageNames()]);
    const waits = [];
    files.forEach((f) => {
        if (!images[f]) {
            waits.push(capture(`http://localhost:3000/posts/${f}`, f));
        }
    });

    await Promise.all(waits);
})();

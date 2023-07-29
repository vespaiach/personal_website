import { watchMarkdownFiles, watchPublicFolder } from "./dev.mjs";

watchMarkdownFiles();
watchPublicFolder('images');
watchPublicFolder('css');
watchPublicFolder('js');
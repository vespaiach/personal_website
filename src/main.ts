import "./styles/global.css";

import Alpine from "alpinejs";

import { registerAboutPage } from "./components/aboutPage";
import { registerCommandPalette } from "./components/commandPalette";
import { registerHeader } from "./components/header";
import { registerPostList } from "./components/postList";
import { registerPostReader } from "./components/postReader";
import { registerTopicList } from "./components/topicList";

registerHeader();
registerCommandPalette();
registerPostList();
registerPostReader();
registerTopicList();
registerAboutPage();

declare global {
  interface Window {
    Alpine: typeof Alpine;
  }
}
window.Alpine = Alpine;
Alpine.start();
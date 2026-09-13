import "./styles/global.css";

import Alpine from "alpinejs";

import { registerAboutPage } from "./components/aboutPage";
import { registerHeader } from "./components/header";
import { registerPostList } from "./components/postList";
import { registerPostReader } from "./components/postReader";
import { registerTopicList } from "./components/topicList";

registerHeader();
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

Alpine.data("terminalPrompts", () => ({ prompts: [] }));

Alpine.start();
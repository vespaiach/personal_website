import { createHash } from "node:crypto";
import { renderMermaid } from "@mermaid-js/mermaid-cli";
import puppeteer, { type Browser } from "puppeteer";

const MERMAID_CONFIG = {
  theme: "base",
  themeVariables: {
    darkMode: true,
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "14px",
    background: "#2e3440",
    primaryColor: "#3b4252",
    primaryTextColor: "#d8dee9",
    primaryBorderColor: "#5e6a80",
    secondaryColor: "#434c5e",
    tertiaryColor: "#434c5e",
    lineColor: "#81a1c1",
    edgeLabelBackground: "#2e3440",
  },
} as const;

const FONT_CSS = { cssUrl: new URL("./mermaidFonts.css", import.meta.url), allowParentDirectoryLevel: 2 };

let browser: Promise<Browser> | undefined;

export async function renderMermaidSvg(definition: string): Promise<string> {
  browser ??= puppeteer.launch({ args: ["--no-sandbox"] });
  const { data } = await renderMermaid(await browser, definition, "svg", {
    backgroundColor: "transparent",
    mermaidConfig: MERMAID_CONFIG,
    customFontCSS: [FONT_CSS],
    fontEmbed: false,
    svgId: `mermaid-${createHash("sha256").update(definition).digest("hex").slice(0, 8)}`,
  });
  return new TextDecoder().decode(data);
}

export async function closeMermaidBrowser(): Promise<void> {
  const launched = browser;
  browser = undefined;
  await (await launched)?.close();
}
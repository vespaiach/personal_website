onmessage = (event) => {
	const { language, text } = event.data;
  const lang = language.replace('language-', '');
  importScripts('/highlight.min.js');
  importScripts(`/languages/${lang}.min.js`);
  const result = self.hljs.highlight(text, { language: lang, ignoreIllegals: true });
	postMessage({ highlightedCode: result.value, language: lang, rawCode: text });
  close();
};

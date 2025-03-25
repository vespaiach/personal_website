onmessage = (event) => {
	const { languages, text } = event.data;
  importScripts('/highlight.min.js');
  importScripts(`/language/${languages.replace('language-')}.min.js`);
	debugger
  const result = self.hljs.highlightAuto(event.data);
  postMessage(result.value);
	

	for (const language of languages) {
		try {
			import(`/languages/${language}.min.js`).then((module) => {
				hljs.registerLanguage(language, module.default)
				hljs.highlightElement(element)
			})
		} catch (e) {
			console.error(e)
		}
	}
};
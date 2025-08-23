/// <reference lib="webworker" />

import { MarkdownLexer } from '@classes/markdown/lexer';
import { MarkdownParser } from '@classes/markdown/parser';

addEventListener('message', ({ data }) => {
	const mdTree = new MarkdownParser().parse(new MarkdownLexer().tokenize(data));
	postMessage(mdTree);
});

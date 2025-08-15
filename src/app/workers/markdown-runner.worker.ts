/// <reference lib="webworker" />

import { ConvertToHtmlTree } from '@classes/markdown';

addEventListener('message', ({ data }) => {
	const mdTree = ConvertToHtmlTree(data);
	postMessage(mdTree);
});

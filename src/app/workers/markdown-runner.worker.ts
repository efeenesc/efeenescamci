/// <reference lib="webworker" />

import { ConvertToHtmlTree } from "../classes/markdown/Markdown";

addEventListener('message', ({ data }) => {
  const mdTree = ConvertToHtmlTree(data);
  postMessage(mdTree);
});

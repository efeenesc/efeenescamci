/// <reference lib="webworker" />

import { lex, parse } from "../classes/markdownparser";

addEventListener('message', ({ data }) => {
  const lexed = lex(data);
  const mdTree = parse(lexed);
  postMessage(mdTree);
});

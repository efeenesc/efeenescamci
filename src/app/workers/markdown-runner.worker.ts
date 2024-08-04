/// <reference lib="webworker" />

import { lex, parse } from "../classes/markdownparser";

addEventListener('message', ({ data }) => {
  console.log("got data");
  const lexed = lex(data);
  const mdTree = parse(lexed);
  console.log("returning");
  postMessage(mdTree);
});

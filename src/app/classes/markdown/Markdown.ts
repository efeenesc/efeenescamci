import { lex } from "./Lexer";
import { MdNode } from "./Markdown.interface";
import { parse } from "./Parser";

export { MdNode };

export function ConvertToHtmlTree(markdown: string): MdNode {
  const lexed = lex(markdown);
  const parsed = parse(lexed);
  return parsed;
}
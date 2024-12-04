export type MdNodeType =
    | "text"
    | "line"
    | "p"
    | "ul"
    | "ol"
    | "li"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "code"
    | "bq"
    | "b"
    | "i"
    | "bi"
    | "a" // A full link
    | "ad" // Link's display text
    | "al" // Link's URL
    | "st"
    | "br"
    | "document";

export const typeMap: { [key: string]: MdNodeType } = {
    "#": "h1",
    "##": "h2",
    "###": "h3",
    "####": "h4",
    "#####": "h5",
    "######": "h6",
    "-": "ul",
    ">": "bq",
    "*": "i",
    "**": "b",
    "***": "bi",
    _: "i",
    __: "b",
    ___: "bi",
    "`": "code",
    "~~": "st",
    "[": "ad",
    "(": "al",
};

/**
 * Repeatable characters.
 */
export const MdSpecialChar: string[] = [
    "#",
    "*",
    "_",
    "~",
    "-",
    ">",
];

export const MdWrapChar: string[] = ["*", "_", "~", "`", '[', ']', '(', ')'];

export class MdNode {
  type: MdNodeType;
  content: MdNode[] | string;
  url?: string;

  constructor(type: MdNodeType, content: MdNode[] | string = []) {
      this.type = type;
      this.content = content;
  }
}

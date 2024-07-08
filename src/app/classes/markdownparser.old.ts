export type MdNodeType =
  | 'text'
  | 'line'
  | 'p'
  | 'ul'
  | 'ol'
  | 'li'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'code'
  | 'blockquote'
  | 'b'
  | 'i'
  | 'bi'
  | 'a'
  | 'st'
  | 'br'
  | 'document';

interface IDictionary<TValue> {
  [id: string]: TValue;
}

const MdNodeDict: IDictionary<string> = {
  '#': 'h1',
  '##': 'h2',
  '###': 'h3',
  '####': 'h4',
  '#####': 'h5',
  '######': 'h6',
  '*': 'i',
  '**': 'b',
  '***': 'bi',
  '~~': 's',
  '`': 'code',
  '-': 'ul',
  '>': 'blockquote',
};

export const MdWrapChar: string[] = ['*', '_', '~', '`', '[', ']', '(', ')'];

export const MdFirstChar: string[] = [
  '#',
  '-',
  '>',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
];

export class MdNode {
  type: MdNodeType;
  content: MdNode[] | string;
  url?: string;

  constructor(type: MdNodeType, content: MdNode[] | string = []) {
    this.type = type;
    this.content = content;
  }
}

export function parseMd(mdstr: string): MdNode {
  const rootNode = new MdNode('document');
  console.log(JSON.stringify(mdstr));
  const lines = mdstr.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') {
      (rootNode.content as MdNode[]).push(new MdNode('br', ''));
      continue;
    }

    const { newNodes } = mdNodeParse(line);
    (rootNode.content as MdNode[]).push(...newNodes);
  }

  return rootNode;
}

function mdNodeParse(
  mdstr: string,
  i: number = 0,
  terminateAt?: string
): { newNodes: MdNode[]; incr?: number } {
  let thisNode: MdNode = new MdNode('document', '');
  let newNodes: MdNode[] = [];
  const root: boolean = i === 0;
  let buf: string[] = [];
  let repeat = 0;
  let lastChar: string | undefined;

  let isSpecial = false;
  let isParagraph = false;

  function addTextNode() {
    if (buf.length > 0) {
      newNodes.push(new MdNode('text', buf.join('')));
      buf = [];
    }
  }

  if (root && !MdFirstChar.includes(mdstr[0])) {
    thisNode.type = 'p';
  }

  while (i < mdstr.length && MdFirstChar.includes(mdstr[i]) && mdstr[i] !== undefined) {
    const char = mdstr[i];

    if (char === lastChar || repeat === 0) repeat++;

    lastChar = char;
    i++;
  }

  if (repeat) {
    const typeChar = lastChar!.repeat(repeat);
    const typeTag = MdNodeDict[typeChar];

    const newNode = new MdNode(typeTag as MdNodeType);
    const { newNodes: childNodes, incr } = MdWrapChar.includes(lastChar!)
      ? mdNodeParse(mdstr, i, lastChar)
      : mdNodeParse(mdstr, i);
    newNode.content = childNodes;
    newNodes.push(newNode);

    i = incr!;
  }

  repeat = 0;

  if (mdstr[i] !== undefined) {
    while (i < mdstr.length && mdstr[i] !== terminateAt) {
      const char = mdstr[i];

      if (MdWrapChar.includes(char)) {
        isSpecial = true;
        if (char === lastChar || repeat === 0) repeat++;
      } else if (isSpecial) {
        isSpecial = false;
        addTextNode();

        const typeChar = lastChar!.repeat(repeat);
        const typeTag = MdNodeDict[typeChar];

        if (typeTag) {
          const newNode = new MdNode(typeTag as MdNodeType);
          const { newNodes: childNodes, incr } = MdWrapChar.includes(lastChar!)
            ? mdNodeParse(mdstr, i, lastChar)
            : mdNodeParse(mdstr, i);
          newNode.content = childNodes;
          newNodes.push(newNode);

          if (incr !== undefined) {
            i = incr;
            if (repeat > 1) i += repeat;
          } else {
            break;
          }
        } else if (lastChar === '[') {
          // Handle links
          const closeBracket = mdstr.indexOf(']', i);
          const openParen = mdstr.indexOf('(', closeBracket);
          const closeParen = mdstr.indexOf(')', openParen);

          if (closeBracket !== -1 && openParen !== -1 && closeParen !== -1) {
            const linkText = mdstr.slice(i, closeBracket);
            const url = mdstr.slice(openParen + 1, closeParen);
            const linkNode = new MdNode('a', [new MdNode('text', linkText)]);
            linkNode.url = url;
            newNodes.push(linkNode);
            i = closeParen;
          }
        }

        repeat = 0;
      } else {
        buf.push(char);
      }

      lastChar = char;
      i++;
    }

    addTextNode();
  }

  if (terminateAt !== undefined) {
    return { newNodes, incr: i };
  } else {
    if (thisNode.type === 'p') {
      thisNode.content = newNodes;
      newNodes = [thisNode];
    }
    return { newNodes };
  }
}

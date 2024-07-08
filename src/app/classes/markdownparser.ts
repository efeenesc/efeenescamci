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
  | 'bq'
  | 'b'
  | 'i'
  | 'bi'
  | 'a'
  | 'st'
  | 'br'
  | 'document';

export interface IDictionary<TValue> {
  [id: string]: TValue;
}

export const MdNodeDict: IDictionary<string> = {
  '#': 'h1',
  '##': 'h2',
  '###': 'h3',
  '####': 'h4',
  '#####': 'h5',
  '######': 'h6',
  '*': 'i',
  '**': 'b',
  '***': 'bi',
  '~~': 'st',
  '`': 'code',
  '-': 'ul',
  '>': 'bq',
};

export const MdSpecialChar: string[] = [
  '#',
  '*',
  '_',
  '~',
  '-',
  '>',
  '[',
  ']',
  '(',
  ')',
];
export const MdWrapChar: string[] = ['*', '_', '~', '`'];

export class MdNode {
  type: MdNodeType;
  content: MdNode[] | string;
  url?: string;

  constructor(type: MdNodeType, content: MdNode[] | string = []) {
    this.type = type;
    this.content = content;
  }
}

export function lex(mdstr: string): string[][] {
  let lines: string[] | string[][] = mdstr.split('\n');
  lines = lines.map((line: string) => {
    let tokens: string[] = line.split(' ');
    let processedTokens: string[] = [];

    tokens.map((token) => {
      let newTokens: string[] = [];
      let buf: string[] = [];
      let isSpecial = false;
      let specialRepeat = 0;
      let lastChar: string = '';

      for (let i = 0; i < token.length; i++) {
        const char = token[i];

        if (MdWrapChar.includes(char)) {
          if (isSpecial && char !== lastChar) {
            newTokens.push(lastChar.repeat(specialRepeat));
            specialRepeat = 0;
          }

          isSpecial = true;

          if (char === lastChar || specialRepeat === 0) specialRepeat++;
        } else if (isSpecial) {
          isSpecial = false;
          if (buf.length > 0) {
            newTokens.push(buf.join(''));
            buf = [];
          }

          const typeChar = lastChar!.repeat(specialRepeat);
          newTokens.push(typeChar);

          buf.push(char);
          specialRepeat = 0;
        } else {
          buf.push(char);
        }

        lastChar = char;
      }

      if (buf.length > 0) {
        newTokens.push(buf.join(''));
        buf = [];
      }

      if (isSpecial) {
        newTokens.push(lastChar.repeat(specialRepeat));
        specialRepeat = 0;
      }

      processedTokens.push(...newTokens);
    });

    return processedTokens;
  });

  return lines;
}

export function parse(l: string[][]): MdNode {
  let rootNode: MdNode = new MdNode('document', []);
  let prevIsNewline = false;

  for (let line of l) {
    const result = processTokens(line, 0);
    if (line.length === 0) {
      if (prevIsNewline) {
        prevIsNewline = false;
        (rootNode.content as MdNode[]).push(new MdNode('br', ''));
      }

      prevIsNewline = true;
      continue;
    }
    (rootNode.content as MdNode[]).push(...result.nodes);
  }

  return rootNode;
}

function processTokens(
  tokens: string[],
  index: number = 0,
  closingToken?: string
): { nodes: MdNode[]; index: number } {
  const nodes: MdNode[] = [];
  let textBuffer: string[] = [];

  function flushTextBuffer() {
    if (textBuffer.length > 0) {
      nodes.push(new MdNode('text', textBuffer.join(' ')));
      textBuffer = [];
    }
  }

  while (index < tokens.length) {
    const token = tokens[index];

    if (token === closingToken) {
      flushTextBuffer();
      return { nodes, index };
    }

    const nodeType = getNodeType(token);
    if (nodeType) {
      flushTextBuffer();
      const { nodes: childNodes, index: newIndex } = processTokens(
        tokens,
        index + 1,
        getClosingToken(token)
      );
      nodes.push(new MdNode(nodeType, childNodes));
      index = newIndex;
    } else {
      textBuffer.push(token);
    }

    index++;
  }

  flushTextBuffer();
  return { nodes, index };
}

function getNodeType(token: string): MdNodeType | null {
  const typeMap: { [key: string]: MdNodeType } = {
    '#': 'h1',
    '##': 'h2',
    '###': 'h3',
    '>': 'bq',
    '*': 'i',
    _: 'i',
    '**': 'b',
    __: 'b',
    '***': 'bi',
    ___: 'bi',
    '`': 'code',
    '~~': 'st',
  };
  return typeMap[token] || null;
}

function getClosingToken(token: string): string {
  const closingMap: { [key: string]: string } = {
    '#': '\n',
    '##': '\n',
    '###': '\n',
    '>': '\n',
    '*': '*',
    _: '_',
    '**': '**',
    __: '__',
    '***': '***',
    '####': '####',
    '#####': '#####',
    '######': '######',
    ___: '___',
    '`': '`',
    '~~': '~~',
  };
  return closingMap[token] || '';
}

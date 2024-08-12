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

export const typeMap: { [key: string]: MdNodeType } = {
  '#': 'h1',
  '##': 'h2',
  '###': 'h3',
  '####': 'h4',
  '#####': 'h5',
  '######': 'h6',
  '-': 'ul',
  '>': 'bq',
  '*': 'i',
  '**': 'b',
  '***': 'bi',
  '_': 'i',
  '__': 'b',
  '___': 'bi',
  '`': 'code',
  '~~': 'st',
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
  lines.pop();
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
  const arrLen = l.length;

  for (let idx = 0; idx < arrLen; idx++) {
    const line = l[idx];
    let rootContent = rootNode.content as MdNode[];

    if (line.length === 0) {
      if (prevIsNewline) {
        prevIsNewline = false;
        console.log('br inserted');
        rootContent.push(new MdNode('br', ''));
      }

      prevIsNewline = true;
      continue;
    }

    const result = processTokens(line);

    switch (result.nodes[0].type) {
      case "li":

      case "ul":
        let newNode;
        if (rootContent[rootContent.length-1].type !== 'ol') {
          newNode = new MdNode('ol', [...result.nodes]);
          rootContent.push(newNode);
        } else {
          (rootContent[rootContent.length-1].content as MdNode[]).push(...result.nodes);
        }
        break;

      default:
        rootContent.push(...result.nodes);
        break;
    }
  }

  return rootNode;
}

function lookAheadFind(targetToken: string, tokens: string[], startFrom: number) : number {
  const arrLen = tokens.length;
  for (; startFrom < arrLen; startFrom++) {
    if (tokens[startFrom] === targetToken)
      return startFrom;
  }
  return -1;
}

function processTokens(
  tokens: string[],
  index: number = 0,
  closingToken?: string
): { nodes: MdNode[]; index: number; } {
  const arrlen = tokens.length;
  const nodes: MdNode[] = [];
  let textBuffer: string[] = [];

  function flushTextBuffer() {
    if (textBuffer.length > 0) {
      nodes.push(new MdNode('text', textBuffer.join(' ')));
      textBuffer = [];
    }
  }

  for (; index < arrlen; index++) {
    const token = tokens[index];

    if (closingToken && token === closingToken) {
      flushTextBuffer();
      return { nodes, index };
    }

    const nodeType = getNodeType(token);
    if (nodeType) {
      flushTextBuffer();
      const closingToken = getClosingToken(token);
      let tokenClosed = true;
      if (closingToken) {
        tokenClosed = lookAheadFind(closingToken, tokens, index + 1) === -1 ? false : true;
      }

      if (tokenClosed) {
        const { nodes: childNodes, index: newIndex } = processTokens(
          tokens,
          index + 1,
          closingToken
        );
  
        nodes.push(new MdNode(nodeType, childNodes));
        index = newIndex;
        continue;
      }
    } 
    
    textBuffer.push(token);
  }

  flushTextBuffer();
  return { nodes, index };
}

function getNodeType(token: string): MdNodeType | undefined {
  const result = typeMap[token];

  if (result)
    return result;

  if (token.endsWith(".") && !isNaN(Number(token.substring(0, token.length-1)))) {
    return "li";
  }

  return;
}

function getClosingToken(token: string): string | undefined {
  switch(token) {
    case "*":
    case "**":
    case "***":
    case '_':
    case '__':
    case '___':
    case '`':
    case '~~':
      return token;

    default:
      return;
  }
}

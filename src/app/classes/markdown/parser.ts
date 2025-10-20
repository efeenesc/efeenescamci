import { LexNode } from './lexer.interface';
import {
	NODE,
	ASTRootNode,
	WRAPPABLE,
	ASTHTMLDivNode,
} from './parser.interface';
import { Stack } from './stack';

const inlineKeys: Record<string, WRAPPABLE> = {
	'*': { state: 'ITALIC', wrap: 'self' },
	'**': { state: 'BOLD', wrap: 'self' },
	'***': { state: 'STRONG', wrap: 'self' },

	_: { state: 'ITALIC', wrap: 'self' },
	__: { state: 'BOLD', wrap: 'self' },
	___: { state: 'STRONG', wrap: 'self' },

	'`': { state: 'INLINECODE', wrap: 'self' },
	'~~': { state: 'STRIKETHROUGH', wrap: 'self' },
	'(': { state: 'PARENTHESES', wrap: 'self' },
};

const breakIfEncountered = ['-', '>', 'n.'];

const map: Record<string, NODE> = {
	...inlineKeys,

	'#': { state: 'HEADER', level: 1 },
	'##': { state: 'HEADER', level: 2 },
	'###': { state: 'HEADER', level: 3 },
	'####': { state: 'HEADER', level: 4 },
	'#####': { state: 'HEADER', level: 5 },
	'######': { state: 'HEADER', level: 6 },

	'-': { state: 'LISTITEM' },
	'>': { state: 'BLOCKQUOTE' },
	'```': { state: 'BLOCKCODE', wrap: 'self' },
};

export class MarkdownParser {
	private root: ASTRootNode = { type: 'DOCUMENT', value: [] };
	private stack = new Stack();
	private textbuf: string[] = [];

	parse(input: LexNode[]): ASTRootNode {
		for (let i = 0; i < input.length; i++) {
			const token = input[i];
			const config = map[token.type];

			switch (token.type) {
				case 'text':
					this.textbuf.push(token.value || '');
					break;
				case '\n': {
					const next = input[i + 1];
					if (this.stack.cur && this.stack.cur!.type === 'BLOCKCODE') {
						this.textbuf.push('\n');
					} else if (next && next.type === '\n') {
						this.flushPendingText();
						this.flushNodes();
						i++; // skip over the next \n
					} else if (!next) {
						this.flushPendingText();
						this.flushNodes();
						// this.flushNodes();
					} else if (breakIfEncountered.includes(next.type)) {
						this.flushPendingText();
						this.stack.complete();
					}
					break;
				}
				case '#':
				case '##':
				case '###':
				case '####':
				case '#####':
				case '######':
					if (this.stack.length !== 0) {
						this.textbuf.push(token.type);
					} else {
						this.stack.push({
							type: 'HEADING',
							level: config.level!,
							value: [],
						});
					}
					break;
				case '*':
				case '**':
				case '***':
				case '_':
				case '__':
				case '___':
				case '~~':
					if (this.stack.cur && this.stack.cur.type === config.state) {
						this.flushPendingText();
						this.stack.complete();
					} else if (this.lookaheadWrap(i, input, token.type)) {
						this.flushPendingText();
						if (!this.stack.cur) {
							this.stack.push({ type: 'PARAGRAPH', value: [] });
						}
						this.stack.push({ type: config.state as any, value: [] });
					} else {
						this.textbuf.push(token.type);
					}
					break;
				case '`':
				case '```':
					this.flushPendingText();
					if (!this.stack.cur || this.stack.cur!.type !== config.state) {
						this.stack.push({ type: config.state as any, value: [] });
					} else {
						this.stack.complete();
					}
					break;
				case '<': {
					const n1 = input[i + 1];
					const n2 = input[i + 2];
					if (n1 && n1.type === 'text') {
						if (n1.value === 'br' && n2.type === '>') {
							this.stack.push({ type: 'BREAKLINE', value: '' } as any);
							this.stack.complete();
							i += 2; // skip over these two tokens
							break;
						}

						if (!n1.value) {
							this.textbuf.push(token.type);
							break;
						}

						const chunks = n1.value.split(' ');
						if (chunks[0] === 'div') {
							const obj: ASTHTMLDivNode = {
								type: 'HTMLDIV',
								props: {} as any,
								value: [],
							};
							let shouldbreak = false;
							for (const chunk of chunks.slice(1)) {
								const words = chunk.split('=');
								const k = words[0];
								const v = words[1];
								if (k !== 'align' && k !== 'width') {
									shouldbreak = true;
									break;
								}
								if (v[0] !== '"' || v[v.length - 1] !== '"') {
									shouldbreak = true;
									break;
								}
								obj.props[k] = v.slice(1, -1);
							}
							if (shouldbreak) break;
							this.stack.push(obj);
							i += 2; // skip over these two tokens
						} else if (
							chunks[0] === '/div' &&
							this.stack.cur &&
							this.stack.cur.type === 'HTMLDIV'
						) {
							this.stack.complete();
							i += 2; // skip over these two tokens
						} else {
							this.textbuf.push(token.type);
							break;
						}
					} else {
						this.textbuf.push(token.type);
					}
					break;
				}
				case '-': {
					let inUL = this.stack.cur && this.stack.cur.type === 'UNORDEREDLIST';
					if (this.stack.length === 0 && this.textbuf.length === 0 && !inUL) {
						this.stack.push({ type: 'UNORDEREDLIST', value: [] });
						inUL = true;
					}

					if (inUL) {
						this.stack.push({ type: 'LISTITEM', value: [] });
					} else {
						this.textbuf.push('- ');
					}
					break;
				}
				case 'n.': {
					let inOL = this.stack.cur && this.stack.cur.type === 'ORDEREDLIST';
					if (this.stack.length === 0 && this.textbuf.length === 0 && !inOL) {
						this.stack.push({ type: 'ORDEREDLIST', value: [] });
						inOL = true;
					}

					if (inOL) {
						this.stack.push({ type: 'LISTITEM', value: [] });
					} else {
						this.textbuf.push('- ');
					}
					break;
				}
				case '>':
					if (this.stack.length !== 0 || this.stack.state) {
						this.textbuf.push(token.type + ' ');
					} else {
						this.stack.push({
							type: config.state as any,
							value: [],
						});
					}
					break;
				case '!':
					if (
						this.stack.state !== 'BLOCKCODE' &&
						this.lookaheadLink(i + 1, input)
					) {
						this.flushPendingText();
						this.stack.push({ type: 'IMAGE', url: '', value: [] });
					} else {
						this.textbuf.push('!');
					}
					break;
				case '[':
					if (this.stack.cur && this.stack.cur.type === 'IMAGE') {
						break;
					}
					if (this.stack.state === 'BLOCKCODE') {
						break; // skip, we're in code
					}
					if (this.lookaheadLink(i, input)) {
						this.flushPendingText();
						this.stack.push({ type: 'LINK', url: '', value: [] });
					} else {
						this.textbuf.push('[');
					}
					break;
				case ']':
				case '(':
					if (this.stack.state === 'BLOCKCODE') {
						this.textbuf.push(token.value!);
						break;
					}
					if (
						this.stack.cur &&
						(this.stack.cur.type === 'LINK' || this.stack.cur.type === 'IMAGE')
					) {
						this.flushPendingText();
					} else {
						this.textbuf.push('(');
					}
					break;
				case ')':
					if (this.stack.state === 'BLOCKCODE') {
						this.textbuf.push(token.value!);
						break;
					}
					if (
						this.stack.cur &&
						(this.stack.cur.type === 'LINK' || this.stack.cur.type === 'IMAGE')
					) {
						this.stack.cur.url = this.textbuf.join('');
						this.textbuf = [];
						this.stack.complete();
					} else {
						this.textbuf.push(')');
					}
					break;
			}
		}

		this.flushPendingText();
		this.flushNodes();
		this.root.value = this.stack.getResult();
		return this.root;
	}

	private flushPendingText() {
		if (!this.textbuf || this.textbuf.length === 0) return;

		if (!this.stack.cur) {
			this.stack.push({ type: 'PARAGRAPH', value: [] });
		}

		this.stack.push({
			type: 'TEXT',
			value: this.textbuf.join(''),
		});

		this.textbuf = [];
	}

	private lookaheadWrap(
		idx: number,
		input: LexNode[],
		token: '*' | '**' | '***' | '_' | '__' | '___' | '~~',
	) {
		idx++;
		let newlines = 0;
		while (idx < input.length) {
			const ch = input[idx];
			if (ch.type === '\n') {
				newlines++;
				if (newlines === 2) {
					return false;
				}
			} else if (ch.type === token) {
				return true;
			}
			idx++;
		}
		return false;
	}

	private lookaheadLink(idx: number, input: LexNode[]) {
		idx++;
		let bracketclose = false;
		let paranopen = false;
		let paranclose = false;
		while (idx < input.length && !(bracketclose && paranopen && paranclose)) {
			const ch = input[idx];
			switch (ch.type) {
				case '[':
					return false;
				case ']':
					bracketclose = true;
					break;
				case '(':
					paranopen = true;
					break;
				case ')':
					paranclose = true;
					break;
			}
			idx++;
		}
		return bracketclose && paranopen && paranclose;
	}

	private flushNodes() {
		this.stack.clear();
	}
}

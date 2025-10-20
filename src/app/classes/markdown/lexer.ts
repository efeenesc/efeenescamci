import { LexNode } from './lexer.interface';

interface RepeatingTypeConfig {
	max: number;
	endsWith?: string;
	optEndsWith?: string;
}

const SPECIAL_TOKENS: Record<string, RepeatingTypeConfig> = {
	'>': { max: 0, endsWith: ' ', optEndsWith: '\n' },
	'-': { max: 0, endsWith: ' ' },
	'*': { max: 3 },
	_: { max: 3 },
	'#': { max: 6, endsWith: ' ' },
	'~': { max: 2 },
	'`': { max: 3, optEndsWith: '\n' },
};

export class MarkdownLexer {
	private tokens: LexNode[] = [];
	private textbuf: string[] = [];

	tokenize(input: string): LexNode[] {
		for (let i = 0; i < input.length; i++) {
			const ch = input[i];
			const tok = this.charmap(ch);
			switch (tok) {
				case 'TEXT': {
					this.textbuf.push(ch);
					break;
				}
				case 'NUM': {
					const {
						num,
						lastValidIndex: index,
						isList,
					} = this.parseNumber(i, input);

					if (!isList) {
						this.textbuf.push(num as string);
					} else {
						this.flushtextbuf();
						this.tokens.push({ type: 'n.', value: num });
					}
					i = index;
					break;
				}
				default: {
					if (SPECIAL_TOKENS[tok]) {
						const result = this.parseRepeatingToken(ch as any, i, input, {
							...SPECIAL_TOKENS[tok],
						});
						if (!result) {
							this.textbuf.push(ch);
						} else {
							const [token, index] = result;
							this.flushtextbuf();
							i = index;
							this.tokens.push(token);
						}
					} else {
						this.flushtextbuf();
						this.tokens.push({ value: tok, type: tok as any });
					}
				}
			}
		}

		this.flushtextbuf();
		return this.tokens;
	}

	private flushtextbuf() {
		if (!this.textbuf.length) return;
		this.tokens.push({ value: this.textbuf.join(''), type: 'text' });
		this.textbuf = [];
	}

	private parseRepeatingToken(
		token: keyof typeof SPECIAL_TOKENS,
		index: number,
		input: string,
		config: RepeatingTypeConfig,
	): [LexNode, number] | null {
		index++;
		let state = token;
		let repeatCount = 1;
		const { max, endsWith, optEndsWith } = config;
		let endsWithFound = false;
		let optEndsWithRequired = false;

		while (index < input.length) {
			const character = input[index];
			if (character === token && (max === 0 || repeatCount < max)) {
				if (optEndsWith) {
					optEndsWithRequired = true;
				}
				state += token;
				repeatCount++;
				index++;
			} else if (character === endsWith || character === optEndsWith) {
				endsWithFound = true;
				break;
			} else {
				index--;
				break;
			}
		}

		if ((endsWith || optEndsWithRequired) && !endsWithFound) {
			return null;
		}

		return [{ type: state as any }, index];
	}

	private parseNumber(index: number, input: string) {
		let number = '';
		let isList = false;
		let lastValidIndex = index;
		if (index !== 0 && input[index - 1] !== '\n') {
			return { num: input[index], lastValidIndex: index, isList: false };
		}
		while (index < input.length && !isList) {
			const character = input[index];
			switch (character) {
				case '0':
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
					number += character;
					lastValidIndex = index;
					break;
				case '.':
					if (input[index + 1] === ' ') {
						lastValidIndex = index + 1;
						isList = true;
					}
					break;
			}
			index++;
		}
		return { num: number, lastValidIndex, isList };
	}

	private charmap(character: string) {
		switch (character) {
			case '*':
			case '_':
			case '#':
			case '[':
			case ']':
			case '(':
			case ')':
			case '~':
			case '-':
			case '<':
			case '>':
			case '`':
			case '!':
			case '\n':
				return character;
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
				return 'NUM';
			default:
				return 'TEXT';
		}
	}
}

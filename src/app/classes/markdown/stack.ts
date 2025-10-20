import { ASTNode } from './parser.interface';

type StackASTNode = ASTNode;

export class Stack {
	private result: ASTNode[] = [];
	private stack: StackASTNode[] = [];
	cur: StackASTNode | null = null;
	state:
		| 'HEADING'
		| 'BLOCKCODE'
		| 'BLOCKQUOTE'
		| 'UNORDEREDLIST'
		| 'ORDEREDLIST'
		| null = null;

	get length(): number {
		return this.stack.length;
	}

	clear() {
		while (this.stack.length > 0) {
			this.complete();
		}
	}

	pop() {
		const popped = this.stack.pop();
		if (!popped) {
			throw new Error('Nothing to pop!');
		}
		this.cur = this.stack[this.stack.length - 1] || null;
		this.updateState();
		return popped;
	}

	get(relative = 0) {
		if (relative <= 0) {
			return this.stack[this.stack.length + relative];
		} else {
			return this.stack[relative];
		}
	}

	complete() {
		if (!this.cur) {
			return;
		}
		const completed = this.pop();
		if (!this.cur) {
			this.result.push(completed);
		} else if (this.cur.type !== 'TEXT') {
			this.cur.value.push(completed);
		} else {
			throw new Error('Unexpected TEXT node');
		}
	}

	delete() {
		if (!this.cur) throw new Error('Nothing to delete!');
		this.pop();
	}

	push(el: ASTNode) {
		if (this.cur && this.cur.type === 'TEXT') {
			throw new Error('Unexpected TEXT node');
		}

		if (el.type === 'TEXT') {
			if (!this.cur) {
				throw new Error('Nothing to add text to!');
			}
			this.cur.value.push(el);
		} else {
			this.updateStateForElement(el);
			const length = this.stack.push(el) - 1;
			this.cur = this.stack[length];
		}
	}

	getResult() {
		return this.result;
	}

	private updateState() {
		if (
			this.cur &&
			(this.cur.type === 'BLOCKCODE' ||
				this.cur.type === 'HEADING' ||
				this.cur.type === 'BLOCKQUOTE' ||
				this.cur.type === 'UNORDEREDLIST' ||
				this.cur.type === 'ORDEREDLIST')
		) {
			this.state = this.cur.type;
		} else {
			this.state = null;
		}
	}

	private updateStateForElement(element: ASTNode) {
		if (
			element.type === 'BLOCKCODE' ||
			element.type === 'HEADING' ||
			element.type === 'BLOCKQUOTE' ||
			element.type === 'UNORDEREDLIST' ||
			element.type === 'ORDEREDLIST'
		) {
			this.state = element.type;
		} else {
			this.state = null;
		}
	}
}

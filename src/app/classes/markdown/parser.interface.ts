export type ASTNode =
	| ASTRootNode
	| ASTHeadingNode
	| ASTInlineCodeNode
	| ASTTextNode
	| ASTLinkNode
	| ASTImageNode
	| ASTBoldNode
	| ASTItalicNode
	| ASTStrongNode
	| ASTHTMLBreaklineNode
	| ASTBlockQuoteNode
	| ASTBlockCodeNode
	| ASTOrderedListNode
	| ASTUnorderedListNode
	| ASTListItemNode
	| ASTStrikethroughNode
	| ASTParaNode
	| ASTHTMLDivNode
	| ASTHTMLImageNode;

export type ASTBlockNode =
	| ASTHeadingNode
	| ASTOrderedListNode
	| ASTUnorderedListNode
	| ASTInlineCodeNode
	| ASTBlockQuoteNode
	| ASTBlockCodeNode
	| ASTParaNode
	| ASTHTMLDivNode
	| ASTHTMLImageNode;

export type ASTInlineNode =
	| ASTTextNode
	| ASTLinkNode
	| ASTImageNode
	| ASTBoldNode
	| ASTItalicNode
	| ASTStrongNode
	| ASTHTMLBreaklineNode
	| ASTListItemNode
	| ASTStrikethroughNode;

export interface ASTRootNode {
	type: 'DOCUMENT';
	value: ASTNode[];
}

export interface ASTHeadingNode {
	type: 'HEADING';
	level: number;
	value: ASTNode[];
}

export interface ASTInlineCodeNode {
	type: 'INLINECODE';
	value: ASTNode[];
}

export interface ASTBlockCodeNode {
	type: 'BLOCKCODE';
	value: ASTNode[];
}

export interface ASTTextNode {
	type: 'TEXT';
	value: string;
}

export interface ASTLinkNode {
	type: 'LINK';
	value: ASTNode[];
	url: string;
}

export interface ASTImageNode {
	type: 'IMAGE';
	value: ASTNode[];
	url: string;
}

export interface ASTBoldNode {
	type: 'BOLD';
	value: ASTNode[];
}

export interface ASTItalicNode {
	type: 'ITALIC';
	value: ASTNode[];
}

export interface ASTStrongNode {
	type: 'STRONG';
	value: ASTNode[];
}

export interface ASTBlockQuoteNode {
	type: 'BLOCKQUOTE';
	value: ASTNode[];
}

export interface ASTOrderedListNode {
	type: 'ORDEREDLIST';
	value: ASTNode[];
}

export interface ASTUnorderedListNode {
	type: 'UNORDEREDLIST';
	value: ASTNode[];
}

export interface ASTListItemNode {
	type: 'LISTITEM';
	value: ASTNode[];
}

export interface ASTStrikethroughNode {
	type: 'STRIKETHROUGH';
	value: ASTNode[];
}

export interface ASTParaNode {
	type: 'PARAGRAPH';
	value: ASTNode[];
}

export interface ASTHTMLDivNode {
	type: 'HTMLDIV';
	props: Record<'align' | 'width', string>;
	value: ASTNode[];
}

export interface ASTHTMLImageNode {
	type: 'HTMLIMG';
	props: Record<'align' | 'width' | 'src' | 'alt', string>;
	value: never & string;
}

export interface ASTHTMLBreaklineNode {
	type: 'HTMLBR';
	props: never;
	value: never & string;
}

export type NODE = BASE | LEVELED | WRAPPABLE;

export interface BASE {
	state: 'LISTITEM' | 'BLOCKQUOTE';
	wrap?: never;
	level?: never;
}

export interface LEVELED {
	state: 'HEADER';
	level: number;
	wrap?: never;
}

export interface WRAPPABLE {
	state:
		| 'BOLD'
		| 'ITALIC'
		| 'STRONG'
		| 'INLINECODE'
		| 'STRIKETHROUGH'
		| 'BLOCKCODE'
		| 'LINK'
		| 'PARENTHESES';
	wrap: 'self' | string[];
	level?: never;
}

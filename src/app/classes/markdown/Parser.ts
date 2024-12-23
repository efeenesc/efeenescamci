import { MdNode, MdNodeType, typeMap } from "./index.interface";

export function parse(l: string[][]): MdNode {
	// Initialize the root node of type "document" with an empty content array
	const rootNode: MdNode = new MdNode("document", []);
	let prevIsNewline = false; // Tracks if the previous line was empty
	const arrLen = l.length;

	for (let idx = 0; idx < arrLen; idx++) {
		const line = l[idx];
		const rootContent = rootNode.content as MdNode[];

		if (line.length === 0) {
			// Handle consecutive empty lines by adding a line break node ("br")
			if (prevIsNewline) {
				prevIsNewline = false;
				rootContent.push(new MdNode("br", ""));
			}

			prevIsNewline = true;
			continue;
		}

		// Process the tokens in the current line
		const { nodes: result } = processTokens(line);

		switch (result[0].type) {
			case "li": // List item
			case "ul": // Unordered list
				// Delegate handling of list items to a dedicated function
				handleListItems(rootContent, { nodes: result });
				break;

			default:
				// For other types, simply append the processed nodes to root content
				rootContent.push(...result);
				break;
		}
	}

	// Merge consecutive text nodes to optimize the output structure
	rootNode.content = mergeTextObjects(rootNode.content);
	return rootNode;
}

function convertUlToLi(nodes: MdNode[]): MdNode[] {
	// Converts all "ul" nodes in the array to "li" nodes
	return nodes.map((node) =>
		node.type === "ul" ? new MdNode("li", node.content) : node
	);
}

function handleListItems(rootContent: MdNode[], result: { nodes: MdNode[] }) {
	const firstNode = result.nodes[0];
	const listType = firstNode.type === "ul" ? "ul" : "ol"; // Determine list type
	const lastNode = rootContent[rootContent.length - 1];

	// Convert "ul" nodes to "li" nodes for consistency
	const processedNodes = convertUlToLi(result.nodes);

	if (lastNode && lastNode.type === listType) {
		// If the last node is of the same list type, append to it
		(lastNode.content as MdNode[]).push(...processedNodes);
	} else {
		// Otherwise, create a new list node and add it to the root content
		const newNode = new MdNode(listType, processedNodes);
		rootContent.push(newNode);
	}
}

function mergeTextObjects(objects: MdNode[] | string): MdNode[] | string {
	// Combines consecutive "text" nodes into a single node to reduce redundancy
	if (typeof objects === "string") return objects;

	return objects.reduce(
		(acc: MdNode[], curr: MdNode, index: number, array: MdNode[]) => {
			if (
				curr.type === "text" &&
				index > 0 &&
				array[index - 1].type === "text"
			) {
				// Merge the content of consecutive text nodes with a space in between
				(acc[acc.length - 1].content as string) += " " + curr.content;
			} else if (curr.type === "text") {
				// Add standalone text nodes directly
				acc.push({ ...curr });
			} else {
				// Recursively process non-text nodes if they have array content
				acc.push({
					...curr,
					content: Array.isArray(curr.content)
						? mergeTextObjects(curr.content)
						: curr.content,
				});
			}
			return acc;
		},
		[]
	);
}

function lookAheadFind(
	targetToken: string,
	tokens: string[],
	startFrom: number
): number {
	// Searches for the index of a target token starting from a specific position
	const arrLen = tokens.length;
	for (; startFrom < arrLen; startFrom++) {
		if (tokens[startFrom] === targetToken) return startFrom;
	}
	return -1; // Return -1 if the token is not found
}

function processTokens(
	tokens: string[],
	index: number = 0,
	closingToken?: string
): { nodes: MdNode[]; index: number } {
	const arrlen = tokens.length;
	const nodes: MdNode[] = []; // To store processed nodes
	let textBuffer: string[] = []; // To accumulate text content

	function flushTextBuffer() {
		// Converts the accumulated text buffer into a text node and clears the buffer
		if (textBuffer.length > 0) {
			nodes.push(new MdNode("text", textBuffer.join(" ")));
			textBuffer = [];
		}
	}

	for (; index < arrlen; index++) {
		const token = tokens[index];

		if (closingToken && token === closingToken) {
			// If a closing token is encountered, finalize and return the nodes
			flushTextBuffer();
			return { nodes, index };
		}

		// Determine the node type of the current token
		const nodeType = getNodeType(token, index);

		if (nodeType) {
			// Flush any accumulated text before processing the new node type
			flushTextBuffer();
			const closingToken = getClosingToken(token);

			// If the token isn't closed and is a list indicator, treat it as a list
			if (index === 0 && ["-", "*", "+"].includes(token)) {
				const { nodes: childNodes, index: newIndex } = processTokens(
					tokens,
					index + 1,
					closingToken
				);

				nodes.push(new MdNode("ul", childNodes));
				index = newIndex;
				continue;
			}

			let tokenClosed = true;
			if (closingToken) {
				// Check if the closing token exists further in the line
				tokenClosed = lookAheadFind(closingToken, tokens, index + 1) !== -1;
			}

			if (tokenClosed) {
				// Process the content enclosed by the token
				const { nodes: childNodes, index: newIndex } = processTokens(
					tokens,
					index + 1,
					closingToken
				);

				const prevNode = nodes[nodes.length - 1];

				switch (nodeType) {
					case "ad": // Anchor (link)
						if (prevNode && prevNode.type === "text" && (prevNode.content as string).endsWith("!")) {
							prevNode.content = (prevNode.content as string).slice(0, -1);
							nodes.push(new MdNode("img", childNodes));
						} else {
							nodes.push(new MdNode("a", childNodes));
						}

						break;

					case "al": // Link content
						if (prevNode && prevNode.type === "a") {
							prevNode.url = childNodes[0].content as string;
						} else if (prevNode && prevNode.type === "img") {
							prevNode.url = childNodes[0].content as string;
						} else {
							nodes.push(new MdNode("text", "(" + childNodes[0].content + ")"));
						}
						break;

					default:
						// Handle other node types (e.g., italic, bold)
						nodes.push(new MdNode(nodeType, childNodes));
						break;
				}

				index = newIndex;
				continue;
			}
		}

		// If no special node type is detected, treat the token as plain text
		textBuffer.push(token);
	}

	// Finalize any remaining text content
	flushTextBuffer();
	return { nodes, index };
}

/**
 * Get node type. Match from typeMap. If given numbered list (i.e. 1., 2., etc.), returns <li>
 * @param token
 * @returns
 */
function getNodeType(token: string, index: number): MdNodeType | undefined {
	const result = typeMap[token];

	if ((result === "ul" || result === "bq" || result === "h1" || result === "h2" || result === "h3") && index !== 0) return;

	if (result) return result;

	const substr = token.substring(0, token.length - 1);

	if (token.endsWith(".") && substr !== "" && isNaN(Number(substr)) === false) {
		return "li";
	}

	return;
}

/**
 * Get the closing token for a given token if it exists. This is only applicable to wrapped tokens (i.e. ` _ *). Returns undefined if token isn't wrappable
 * @param token
 * @returns
 */
function getClosingToken(token: string): string | undefined {
	switch (token) {
		case "*":
		case "**":
		case "***":
		case "_":
		case "__":
		case "___":
		case "`":
		case "~~":
			return token;

		case "[":
			return "]";

		case "(":
			return ")";

		default:
			return;
	}
}

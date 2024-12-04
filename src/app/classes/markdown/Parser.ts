import { MdNode, MdNodeType, typeMap } from "./Markdown.interface";


export function parse(l: string[][]): MdNode {
    const rootNode: MdNode = new MdNode("document", []);
    let prevIsNewline = false;
    const arrLen = l.length;

    for (let idx = 0; idx < arrLen; idx++) {
        const line = l[idx];
        const rootContent = rootNode.content as MdNode[];

        if (line.length === 0) {
            if (prevIsNewline) {
                prevIsNewline = false;
                rootContent.push(new MdNode("br", ""));
            }

            prevIsNewline = true;
            continue;
        }

        const result = processTokens(line);

        switch (result.nodes[0].type) {
            case "li":
            case "ul":
                handleListItems(rootContent, result);
                break;

            default:
                rootContent.push(...result.nodes);
                break;
        }
    }

    rootNode.content = mergeTextObjects(rootNode.content);
    return rootNode;
}

function convertUlToLi(nodes: MdNode[]): MdNode[] {
    return nodes.map((node) =>
        node.type === "ul" ? new MdNode("li", node.content) : node
    );
}

function handleListItems(rootContent: MdNode[], result: { nodes: MdNode[] }) {
    const firstNode = result.nodes[0];
    const listType = firstNode.type === "ul" ? "ul" : "ol";
    const lastNode = rootContent[rootContent.length - 1];

    // Convert 'ul' nodes to 'li' nodes
    const processedNodes = convertUlToLi(result.nodes);

    if (lastNode && lastNode.type === listType) {
        // If the last node is the same type of list, append to it
        (lastNode.content as MdNode[]).push(...processedNodes);
    } else {
        // Otherwise, create a new list node
        const newNode = new MdNode(listType, processedNodes);
        rootContent.push(newNode);
    }
}

function mergeTextObjects(objects: MdNode[] | string): MdNode[] | string {
    if (typeof objects === "string") return objects;

    return objects.reduce(
        (acc: MdNode[], curr: MdNode, index: number, array: MdNode[]) => {
            if (
                curr.type === "text" &&
                index > 0 &&
                array[index - 1].type === "text"
            ) {
                // If current element is text and previous element is also text,
                // combine their content and add a space
                (acc[acc.length - 1].content as string) += " " + curr.content;
            } else if (curr.type === "text") {
                // If it's a text element but not preceded by a text element, just add it
                acc.push({ ...curr });
            } else {
                // For non-text elements, recursively process their content if it's an array
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
    const arrLen = tokens.length;
    for (; startFrom < arrLen; startFrom++) {
        if (tokens[startFrom] === targetToken) return startFrom;
    }
    return -1;
}

function processTokens(
    tokens: string[],
    index: number = 0,
    closingToken?: string
): { nodes: MdNode[]; index: number } {
    const arrlen = tokens.length;
    const nodes: MdNode[] = [];
    let textBuffer: string[] = [];

    function flushTextBuffer() {
        if (textBuffer.length > 0) {
            nodes.push(new MdNode("text", textBuffer.join(" ")));
            textBuffer = [];
        }
    }

    for (; index < arrlen; index++) {
        const token = tokens[index];

        if (closingToken && token === closingToken) {
            flushTextBuffer();
            return { nodes, index };
        }

        // Get node type. If node type is undefined, then this is not a special Markdown character - likely just text.
        const nodeType = getNodeType(token);
        if (nodeType) {
            // Flush all text content and identify what token this is
            flushTextBuffer();
            const closingToken = getClosingToken(token);

            let tokenClosed = true;
            if (closingToken) {
                tokenClosed =
                    lookAheadFind(closingToken, tokens, index + 1) === -1
                        ? false
                        : true;

                // If the * was not closed, and is the first character in the line, then this is likely just an unordered list.
                // Read child nodes of the list item and add them as list items (<li>), then set the parent element to <ul>
                if (
                    !tokenClosed &&
                    index === 0 &&
                    ["-", "*", "+"].includes(token)
                ) {
                    const { nodes: childNodes, index: newIndex } =
                        processTokens(tokens, index + 1, closingToken);

                    nodes.push(new MdNode("ul", childNodes));
                    index = newIndex;
                    continue;
                }
            }

            // If token was closed (i.e. * .... *), then process the text content inside tokens
            // This will then assign an element name (i.e. <i>)
            if (tokenClosed) {
                const { nodes: childNodes, index: newIndex } = processTokens(
                    tokens,
                    index + 1,
                    closingToken
                );

                switch (nodeType) {
                    case "ad":
                        nodes.push(new MdNode("a", childNodes));
                        break;

                    case "al":
                        if (nodes[nodes.length - 1].type === "a") {
                            nodes[nodes.length - 1].url = childNodes[0]
                                .content as string;
                            break;
                        } else {
                            nodes.push(
                                new MdNode(
                                    "text",
                                    childNodes[0].content as string
                                )
                            );
                        }
                        // ! This break was added without testing!
                        break;

                    default:
                        nodes.push(new MdNode(nodeType, childNodes));
                        break;
                }

                index = newIndex;
                continue;
            }
        }

        textBuffer.push(token);
    }

    flushTextBuffer();
    return { nodes, index };
}

/**
 * Get node type. Match from typeMap. If given numbered list (i.e. 1., 2., etc.), returns <li>
 * @param token
 * @returns
 */
function getNodeType(token: string): MdNodeType | undefined {
    const result = typeMap[token];

    if (result) return result;

    const substr = token.substring(0, token.length - 1);

    if (
        token.endsWith(".") &&
        substr !== "" &&
        isNaN(Number(substr)) === false
    ) {
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

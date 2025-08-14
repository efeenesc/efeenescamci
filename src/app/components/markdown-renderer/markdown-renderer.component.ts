import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MdNode } from '../../classes/markdown';

@Component({
	selector: 'markdown-renderer',
	templateUrl: './markdown-renderer.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrl: './markdown-renderer.component.css',
	imports: [],
})
export class MarkdownRendererComponent {
	parsedNode: MdNode[] | undefined;
	@Input() set parsedContent(content: MdNode[] | string) {
		if (typeof content === 'string') {
			this.parsedNode = [new MdNode('text', content)];
		} else {
			this.parsedNode = content;
		}
	}

	public getTextInsideContent(node: string | MdNode[]): string | undefined {
		if (typeof node == 'string') return node;

		const currentNode = node[0];

		if (currentNode.type === 'text') {
			const result = currentNode.content as string;
			return result;
		}

		return;
	}
}

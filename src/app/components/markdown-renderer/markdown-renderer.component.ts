import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MdNode } from '@classes/markdown';
import { MarkdownRendererDirective } from '@directives/markdown-renderer.directive';

@Component({
	selector: 'markdown-renderer',
	standalone: true,
	imports: [MarkdownRendererDirective],
	template: `
		<ng-template id="md-renderer" *markdownRenderer="parsedNode"> </ng-template>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrl: './markdown-renderer.component.css',
})
export class MarkdownRendererComponent {
	parsedNode: MdNode[] | null = null;
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

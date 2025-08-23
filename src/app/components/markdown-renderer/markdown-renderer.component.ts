import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ASTRootNode } from '@classes/markdown/parser.interface';
import { MarkdownRendererDirective } from '@directives/markdown-renderer.directive';

@Component({
	selector: 'markdown-renderer',
	standalone: true,
	imports: [MarkdownRendererDirective],
	template: `
		<ng-template id="md-renderer" *markdownRenderer="parsedContent()">
		</ng-template>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrl: './markdown-renderer.component.css',
})
export class MarkdownRendererComponent {
	parsedContent = input.required<ASTRootNode>();
}

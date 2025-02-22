import type MagicString from 'magic-string';
import {
	findFirstOccurrenceOutsideComment,
	type NodeRenderOptions,
	type RenderOptions,
	renderStatementList
} from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type * as NodeType from './NodeType';
import {
	type ExpressionNode,
	type IncludeChildren,
	NodeBase,
	type StatementNode
} from './shared/Node';

export default class SwitchCase extends NodeBase {
	declare consequent: readonly StatementNode[];
	declare needsBoundaries: true;
	declare test: ExpressionNode | null;
	declare type: NodeType.tSwitchCase;

	hasEffects(context: HasEffectsContext): boolean {
		if (this.test && this.test.hasEffects(context)) return true;
		for (const node of this.consequent) {
			if (context.brokenFlow) break;
			if (node.hasEffects(context)) return true;
		}
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		if (this.test) this.test.include(context, includeChildrenRecursively);
		for (const node of this.consequent) {
			if (includeChildrenRecursively || node.shouldBeIncluded(context))
				node.include(context, includeChildrenRecursively);
		}
	}

	render(code: MagicString, options: RenderOptions, nodeRenderOptions?: NodeRenderOptions): void {
		if (this.consequent.length) {
			this.test && this.test.render(code, options);
			const testEnd = this.test
				? this.test.end
				: findFirstOccurrenceOutsideComment(code.original, 'default', this.start) + 7;
			const consequentStart = findFirstOccurrenceOutsideComment(code.original, ':', testEnd) + 1;
			renderStatementList(this.consequent, code, consequentStart, nodeRenderOptions!.end!, options);
		} else {
			super.render(code, options);
		}
	}
}

SwitchCase.prototype.needsBoundaries = true;

import { type CallOptions, NO_ARGS } from './CallOptions';
import type { HasEffectsContext } from './ExecutionContext';
import type { LiteralValue } from './nodes/Literal';
import { ExpressionEntity, UNKNOWN_EXPRESSION, UnknownValue } from './nodes/shared/Expression';
import {
	EMPTY_PATH,
	type ObjectPath,
	type ObjectPathKey,
	SHARED_RECURSION_TRACKER
} from './utils/PathTracker';

export interface MemberDescription {
	hasEffectsWhenCalled: ((callOptions: CallOptions, context: HasEffectsContext) => boolean) | null;
	returns: ExpressionEntity;
}

export interface MemberDescriptions {
	[key: string]: MemberDescription;
}

interface RawMemberDescription {
	value: MemberDescription;
}

function assembleMemberDescriptions(
	memberDescriptions: { [key: string]: RawMemberDescription },
	inheritedDescriptions: MemberDescriptions | null = null
): MemberDescriptions {
	return Object.create(inheritedDescriptions, memberDescriptions);
}

export const UNDEFINED_EXPRESSION: ExpressionEntity =
	new (class UndefinedExpression extends ExpressionEntity {
		getLiteralValueAtPath() {
			return undefined;
		}
	})();

const returnsUnknown: RawMemberDescription = {
	value: {
		hasEffectsWhenCalled: null,
		returns: UNKNOWN_EXPRESSION
	}
};

export const UNKNOWN_LITERAL_BOOLEAN: ExpressionEntity =
	new (class UnknownBoolean extends ExpressionEntity {
		getReturnExpressionWhenCalledAtPath(path: ObjectPath): ExpressionEntity {
			if (path.length === 1) {
				return getMemberReturnExpressionWhenCalled(literalBooleanMembers, path[0]);
			}
			return UNKNOWN_EXPRESSION;
		}

		hasEffectsWhenAccessedAtPath(path: ObjectPath): boolean {
			return path.length > 1;
		}

		hasEffectsWhenCalledAtPath(
			path: ObjectPath,
			callOptions: CallOptions,
			context: HasEffectsContext
		): boolean {
			if (path.length === 1) {
				return hasMemberEffectWhenCalled(literalBooleanMembers, path[0], callOptions, context);
			}
			return true;
		}
	})();

const returnsBoolean: RawMemberDescription = {
	value: {
		hasEffectsWhenCalled: null,
		returns: UNKNOWN_LITERAL_BOOLEAN
	}
};

export const UNKNOWN_LITERAL_NUMBER: ExpressionEntity =
	new (class UnknownNumber extends ExpressionEntity {
		getReturnExpressionWhenCalledAtPath(path: ObjectPath): ExpressionEntity {
			if (path.length === 1) {
				return getMemberReturnExpressionWhenCalled(literalNumberMembers, path[0]);
			}
			return UNKNOWN_EXPRESSION;
		}

		hasEffectsWhenAccessedAtPath(path: ObjectPath): boolean {
			return path.length > 1;
		}

		hasEffectsWhenCalledAtPath(
			path: ObjectPath,
			callOptions: CallOptions,
			context: HasEffectsContext
		): boolean {
			if (path.length === 1) {
				return hasMemberEffectWhenCalled(literalNumberMembers, path[0], callOptions, context);
			}
			return true;
		}
	})();

const returnsNumber: RawMemberDescription = {
	value: {
		hasEffectsWhenCalled: null,
		returns: UNKNOWN_LITERAL_NUMBER
	}
};

export const UNKNOWN_LITERAL_STRING: ExpressionEntity =
	new (class UnknownString extends ExpressionEntity {
		getReturnExpressionWhenCalledAtPath(path: ObjectPath): ExpressionEntity {
			if (path.length === 1) {
				return getMemberReturnExpressionWhenCalled(literalStringMembers, path[0]);
			}
			return UNKNOWN_EXPRESSION;
		}

		hasEffectsWhenAccessedAtPath(path: ObjectPath): boolean {
			return path.length > 1;
		}

		hasEffectsWhenCalledAtPath(
			path: ObjectPath,
			callOptions: CallOptions,
			context: HasEffectsContext
		): boolean {
			if (path.length === 1) {
				return hasMemberEffectWhenCalled(literalStringMembers, path[0], callOptions, context);
			}
			return true;
		}
	})();

const returnsString: RawMemberDescription = {
	value: {
		hasEffectsWhenCalled: null,
		returns: UNKNOWN_LITERAL_STRING
	}
};

const stringReplace: RawMemberDescription = {
	value: {
		hasEffectsWhenCalled(callOptions, context) {
			const arg1 = callOptions.args[1];
			return (
				callOptions.args.length < 2 ||
				(arg1.getLiteralValueAtPath(EMPTY_PATH, SHARED_RECURSION_TRACKER, {
					deoptimizeCache() {}
				}) === UnknownValue &&
					arg1.hasEffectsWhenCalledAtPath(
						EMPTY_PATH,
						{
							args: NO_ARGS,
							thisParam: null,
							withNew: false
						},
						context
					))
			);
		},
		returns: UNKNOWN_LITERAL_STRING
	}
};

const objectMembers: MemberDescriptions = assembleMemberDescriptions({
	hasOwnProperty: returnsBoolean,
	isPrototypeOf: returnsBoolean,
	propertyIsEnumerable: returnsBoolean,
	toLocaleString: returnsString,
	toString: returnsString,
	valueOf: returnsUnknown
});

const literalBooleanMembers: MemberDescriptions = assembleMemberDescriptions(
	{
		valueOf: returnsBoolean
	},
	objectMembers
);

const literalNumberMembers: MemberDescriptions = assembleMemberDescriptions(
	{
		toExponential: returnsString,
		toFixed: returnsString,
		toLocaleString: returnsString,
		toPrecision: returnsString,
		valueOf: returnsNumber
	},
	objectMembers
);

const literalStringMembers: MemberDescriptions = assembleMemberDescriptions(
	{
		anchor: returnsString,

		at: returnsUnknown,
		big: returnsString,
		blink: returnsString,
		bold: returnsString,
		charAt: returnsString,
		charCodeAt: returnsNumber,
		codePointAt: returnsUnknown,
		concat: returnsString,
		endsWith: returnsBoolean,
		fixed: returnsString,
		fontcolor: returnsString,
		fontsize: returnsString,
		includes: returnsBoolean,
		indexOf: returnsNumber,
		italics: returnsString,
		lastIndexOf: returnsNumber,
		link: returnsString,
		localeCompare: returnsNumber,
		match: returnsUnknown,
		matchAll: returnsUnknown,
		normalize: returnsString,
		padEnd: returnsString,
		padStart: returnsString,
		repeat: returnsString,
		replace: stringReplace,
		replaceAll: stringReplace,
		search: returnsNumber,
		slice: returnsString,
		small: returnsString,
		split: returnsUnknown,
		startsWith: returnsBoolean,
		strike: returnsString,
		sub: returnsString,
		substr: returnsString,
		substring: returnsString,
		sup: returnsString,
		toLocaleLowerCase: returnsString,
		toLocaleUpperCase: returnsString,
		toLowerCase: returnsString,
		toString: returnsString, // overrides the toString() method of the Object object; it does not inherit Object.prototype.toString()
		toUpperCase: returnsString,
		trim: returnsString,
		trimEnd: returnsString,
		trimLeft: returnsString,
		trimRight: returnsString,
		trimStart: returnsString,
		valueOf: returnsString
	},
	objectMembers
);

export function getLiteralMembersForValue<T extends LiteralValue = LiteralValue>(
	value: T
): MemberDescriptions {
	switch (typeof value) {
		case 'boolean':
			return literalBooleanMembers;
		case 'number':
			return literalNumberMembers;
		case 'string':
			return literalStringMembers;
	}
	return Object.create(null);
}

export function hasMemberEffectWhenCalled(
	members: MemberDescriptions,
	memberName: ObjectPathKey,
	callOptions: CallOptions,
	context: HasEffectsContext
): boolean {
	if (typeof memberName !== 'string' || !members[memberName]) {
		return true;
	}
	return members[memberName].hasEffectsWhenCalled?.(callOptions, context) || false;
}

export function getMemberReturnExpressionWhenCalled(
	members: MemberDescriptions,
	memberName: ObjectPathKey
): ExpressionEntity {
	if (typeof memberName !== 'string' || !members[memberName]) return UNKNOWN_EXPRESSION;
	return members[memberName].returns;
}

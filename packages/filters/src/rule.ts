import { CommentData, Delegate, ICommentFilter } from '@ccl2/core';

export const enum FilterMode {
    ACCEPT = 'accept',
    REJECT = 'reject',
}

export type Operator =
    | '<'
    | '>'
    | '~'
    | 'regexp'
    | '='
    | 'eq'
    | '!'
    | 'not'
    | '&&'
    | 'and'
    | '||'
    | 'or';

export interface IRule<OP extends Operator, V> {
    subject: string;
    mode: FilterMode;
    operator: OP;
    value: V;
}

export type Rule =
    | IRule<'>' | '<', number>
    | IRule<'~' | 'regexp', string>
    | IRule<'=' | 'eq', any>
    | IRule<'!' | 'not', Rule>
    | IRule<'&&' | 'and' | '||' | 'or', Rule[]>;

function match(rule: Rule, comment: CommentData): boolean {
    const path = rule.subject.split('.');
    let extracted: any = comment;
    while (path.length > 0) {
        const item = path.shift();
        if (item === '') {
            continue;
        }
        if (extracted.hasOwnProperty(item)) {
            extracted = extracted[item];
        }
        if (extracted === null || typeof extracted === 'undefined') {
            extracted = null;
            break;
        }
    }

    if (extracted === null) {
        // Null precondition implies anything
        return true;
    }

    switch (rule.operator) {
        case '<': {
            return extracted < rule.value;
        }
        case '>': {
            return extracted > rule.value;
        }
        case '~':
        case 'regexp': {
            return new RegExp(rule.value).test(extracted.toString());
        }
        case '=':
        case 'eq': {
            return (
                rule.value ===
                (typeof extracted === 'number'
                    ? extracted
                    : extracted.toString())
            );
        }
        case '!':
        case 'not': {
            return !match(rule.value, extracted);
        }
        case '&&':
        case 'and': {
            if (Array.isArray(rule.value)) {
                return rule.value.every(function (r) {
                    return match(r, extracted);
                });
            } else {
                return false;
            }
        }
        case '||':
        case 'or': {
            if (Array.isArray(rule.value)) {
                return rule.value.some((r) => {
                    return match(r, extracted);
                });
            } else {
                return false;
            }
        }
    }
    return false;
}

export class RuleBasedFilter implements Delegate<ICommentFilter> {
    private readonly rules: Rule[] = [];

    constructor() {}

    add(rule: Rule) {
        this.rules.push(rule);
    }

    removeRule(rule: Rule) {
        const index = this.rules.indexOf(rule);
        if (index >= 0) {
            this.rules.splice(index, 1);
            return true;
        } else {
            return false;
        }
    }

    resolve() {
        return (comment: CommentData) => {
            for (const rule of this.rules) {
                let matched = false;
                try {
                    matched = match(rule, comment);
                } catch (_) {
                    console.warn('[RuleBasedFilter]'); // TODO
                }
                const r = rule.mode === FilterMode.ACCEPT ? matched : !matched;
                if (!r) {
                    return false;
                }
            }
            return true;
        };
    }
}

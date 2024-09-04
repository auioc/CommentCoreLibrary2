import { CommentData, CommentType, Delegate, ICommentFilter } from '@ccl2/core';

export class CommentTypeFilter implements Delegate<ICommentFilter> {
    private _allowUnknown = false;
    private readonly types: { [x in CommentType]?: boolean } = {};

    constructor() {}

    allowUnknown() {
        this._allowUnknown = true;
    }

    denyUnknown() {
        this._allowUnknown = false;
    }

    private set(types: CommentType[], allow: boolean) {
        for (const type of types) {
            this.types[type] = allow;
        }
    }

    allow(...types: CommentType[]) {
        this.set(types, true);
    }

    deny(...types: CommentType[]) {
        this.set(types, false);
    }

    resolve() {
        return (comment: CommentData) => {
            if (
                (!this._allowUnknown || comment.mode in this.types) &&
                !this.types[comment.mode]
            ) {
                return false;
            }
            return true;
        };
    }
}

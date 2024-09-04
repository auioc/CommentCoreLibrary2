import { CommentData } from './comment.js';
import { Delegate } from './types.js';

export interface ICommentFilter {
    (comment: CommentData): boolean;
}

export class FilterSet implements Delegate<ICommentFilter> {
    private readonly delegate: ICommentFilter[] = [];

    constructor() {}

    add(filter: ICommentFilter) {
        this.delegate.push(filter);
    }

    resolve(): ICommentFilter {
        return (comment: CommentData) => {
            for (const filter of this.delegate) {
                if (filter(comment) === false) {
                    return false;
                }
            }
            return true;
        };
    }
}

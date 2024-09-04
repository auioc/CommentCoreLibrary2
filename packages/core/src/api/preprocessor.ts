import { CommentData } from './comment.js';
import { Delegate } from './types.js';

export interface ICommentPreprocessor {
    (comment: CommentData): CommentData;
}

export class PreprocessorSet implements Delegate<ICommentPreprocessor> {
    private readonly delegate: ICommentPreprocessor[] = [];

    constructor() {}

    add(f: ICommentPreprocessor) {
        this.delegate.push(f);
    }

    resolve() {
        return (comment: CommentData) => {
            for (const f of this.delegate) {
                comment = f(comment);
                if (!comment) {
                    return null;
                }
            }
            return comment;
        };
    }
}

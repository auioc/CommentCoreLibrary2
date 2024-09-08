import { CommentData, IComment } from '@api/comment.js';
import { ICommentManager } from '@api/manager.js';
import { CoreComment } from 'renderer/classic/base.js';

export class ScrollComment extends CoreComment {
    constructor(parent: ICommentManager, data: CommentData) {
        super(parent, data);
        this.dur *= this.parent.options.scroll.scale;
        this.ttl *= this.parent.options.scroll.scale;
    }

    set alpha(a: number) {
        this._alpha = a;
        this.element.style.opacity =
            Math.min(
                Math.min(this._alpha, this.parent.options.global.opacity),
                this.parent.options.scroll.opacity
            ) + '';
    }

    public init(recycle: IComment = null): void {
        super.init(recycle);
        this.x = this.parent.width;
        if (this.parent.options.scroll.opacity < 1) {
            this.alpha = this._alpha;
        }
        this.absolute = true;
    }

    public update(): void {
        this.x =
            (this.ttl / this.dur) * (this.parent.width + this.width) -
            this.width;
    }
}

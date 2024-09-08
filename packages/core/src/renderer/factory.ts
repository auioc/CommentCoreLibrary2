import { CommentData, CommentType, IComment } from '@api/comment.js';
import { ICommentManager } from '@api/manager.js';
import { Matrix3D } from '@utils/matrix3d.js';
import { CoreComment } from 'renderer/classic/base.js';
import { ScrollComment } from 'renderer/classic/scroll.js';
import { CssScrollComment } from 'renderer/css/scroll.js';

type Factory = (manager: ICommentManager, data: CommentData) => IComment;

export interface ICommentFactory {
    create: Factory;
}

function initCoreComment(
    manager: ICommentManager,
    data: CommentData
): IComment {
    const cmt = new CoreComment(manager, data);
    cmt.init();
    cmt.transform = Matrix3D.createRotationMatrix(
        0,
        data['rY'],
        data['rZ']
    ).flatArray;
    manager.stage.appendChild(cmt.element);
    return cmt;
}

function initAnchored(manager: ICommentManager, data: CommentData): IComment {
    const cmt = new CoreComment(manager, data);
    switch (cmt.mode) {
        case CommentType.BottomStatic: {
            cmt.align = 2;
            cmt.axis = 2;
            break;
        }
        case CommentType.TopStatic: {
            cmt.align = 0;
            cmt.axis = 0;
            break;
        }
    }
    cmt.init();
    manager.stage.appendChild(cmt.element);
    return cmt;
}

function initScrolling(manager: ICommentManager, data: CommentData): IComment {
    const cmt = new ScrollComment(manager, data);
    switch (cmt.mode) {
        case CommentType.TopScrolling: {
            cmt.align = 0;
            cmt.axis = 0;
            break;
        }
        case CommentType.BottomScrolling: {
            cmt.align = 2;
            cmt.axis = 2;
            break;
        }
        case CommentType.TopReverse: {
            cmt.align = 1;
            cmt.axis = 1;
            break;
        }
    }
    cmt.init();
    manager.stage.appendChild(cmt.element);
    return cmt;
}

function initCssScrolling(
    manager: ICommentManager,
    data: CommentData
): IComment {
    const cmt = new CssScrollComment(manager, data);
    switch (cmt.mode) {
        case CommentType.TopScrolling: {
            cmt.align = 0;
            cmt.axis = 0;
            break;
        }
        case CommentType.BottomScrolling: {
            cmt.align = 2;
            cmt.axis = 2;
            break;
        }
        case CommentType.TopReverse: {
            cmt.align = 1;
            cmt.axis = 1;
            break;
        }
    }
    cmt.init();
    manager.stage.appendChild(cmt.element);
    return cmt;
}

export class CommentFactory implements ICommentFactory {
    private readonly delegate: { [mode in CommentType]?: Factory } = {};

    static defaultClassic(): ICommentFactory {
        const factory = new CommentFactory();
        factory.bind(CommentType.TopScrolling, initScrolling);
        factory.bind(CommentType.BottomScrolling, initScrolling);
        factory.bind(CommentType.TopReverse, initScrolling);
        factory.bind(CommentType.BottomStatic, initAnchored);
        factory.bind(CommentType.TopStatic, initAnchored);
        factory.bind(CommentType.Animation, initCoreComment);
        factory.bind(CommentType.Image, initCoreComment);
        return factory;
    }

    static defaultCssRender(): ICommentFactory {
        const factory = new CommentFactory();
        factory.bind(CommentType.TopScrolling, initCssScrolling);
        factory.bind(CommentType.BottomScrolling, initCssScrolling);
        factory.bind(CommentType.TopReverse, initCssScrolling);
        factory.bind(CommentType.BottomStatic, initAnchored);
        factory.bind(CommentType.TopStatic, initAnchored);
        factory.bind(CommentType.Animation, initCoreComment);
        factory.bind(CommentType.Image, initCoreComment);
        return factory;
    }

    static defaultCanvasRenderFactory(): ICommentFactory {
        throw new Error('Not implemented');
    }

    static defaultSvgRenderFactory(): ICommentFactory {
        throw new Error('Not implemented');
    }

    bind(mode: CommentType, factory: Factory): void {
        this.delegate[mode] = factory;
    }

    canCreate(comment: CommentData): boolean {
        return this.delegate.hasOwnProperty(comment['mode']);
    }

    create(manager: ICommentManager, comment: CommentData): IComment {
        if (comment === null || !comment.hasOwnProperty('mode')) {
            throw new Error('Comment format incorrect');
        }
        if (!this.delegate.hasOwnProperty(comment['mode'])) {
            throw new Error('No binding for comment type ' + comment['mode']);
        }
        return this.delegate[comment['mode']](manager, comment);
    }
}

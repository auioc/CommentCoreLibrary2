import { CommentData, CommentType, IComment } from '@api/comment.js';
import { ICommentFilter } from '@api/filter.js';
import { ICommentPreprocessor } from '@api/preprocessor.js';
import { binarySearch, insertByBinarySearch } from '@utils/array.js';
import { calcVideoRenderedSize } from '@utils/video.js';
import { commentComparator } from 'comment/utils.js';
import {
    AnchorSpaceAllocator,
    ISpaceAllocator,
    SpaceAllocator,
} from 'renderer/allocator.js';
import { CommentFactory, ICommentFactory } from 'renderer/factory.js';

interface CCLOptions {
    global: {
        scale: number;
        opacity: number;
        className: string;
    };
    scroll: {
        scale: number;
        opacity: number;
    };
    // scripting: {
    //     mode: Array<number>;
    //     engine: IScriptingEngine;
    // };
}

export interface ICommentManager {
    stage: HTMLElement;
    width: number;
    height: number;
    options: CCLOptions;
    start(): void;
    stop(): void;
    clear(): void;
    setBounds(w?: number, h?: number): void;
    finish(c: IComment): void;
}

// ========================================================================== //

export class CommentManager implements ICommentManager {
    readonly stage: HTMLElement;
    private timer = 0;
    private listeners: Record<string, [(data?: any) => void]> = {};
    private lastTime = 0;

    options = {
        global: {
            opacity: 1,
            scale: 1,
            className: 'cmt',
        },
        scroll: {
            opacity: 1,
            scale: 1,
        },
        limit: 0,
        seekTrigger: 2000,
    };
    timeline: CommentData[] = [];
    runline: IComment[] = [];
    position = 0;

    readonly spaceAllocators: {
        [x in keyof typeof CommentType]?: ISpaceAllocator;
    } = {
        [CommentType.TopScrolling]: new SpaceAllocator(),
        [CommentType.BottomScrolling]: new SpaceAllocator(),
        [CommentType.TopStatic]: new AnchorSpaceAllocator(),
        [CommentType.BottomStatic]: new AnchorSpaceAllocator(),
        [CommentType.TopReverse]: new SpaceAllocator(),
    };

    factory: ICommentFactory;
    filter: ICommentFilter;
    preprocessor: ICommentPreprocessor;

    width: number;
    height: number;

    constructor(stage: HTMLElement) {
        this.stage = stage;
        this.width = this.stage.offsetWidth;
        this.height = this.stage.offsetHeight;
    }

    private startTimer() {
        if (this.timer > 0) {
            return;
        }
        let lastTPos = new Date().getTime();
        this.timer = window.setInterval(() => {
            const elapsed = new Date().getTime() - lastTPos;
            lastTPos = new Date().getTime();
            this.onTimerEvent(elapsed, this);
        }, 10);
    }

    start() {
        this.startTimer();
    }

    private stopTimer() {
        window.clearInterval(this.timer);
        this.timer = 0;
    }

    stop() {
        this.stopTimer();
        this.runline.forEach((c) => c.stop());
    }

    load(comments: CommentData[]) {
        this.timeline = comments;
        this.timeline.sort(commentComparator);
        this.dispatchEvent('load');
        console.debug('[CCL2][Core] loaded %d danmaku', comments.length);
    }

    seek(time: number) {
        this.position = binarySearch(
            this.timeline,
            time, //
            (a, b) => {
                if (a < b.stime) {
                    return -1;
                } else if (a > b.stime) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }

    insert(comment: IComment) {
        const index = insertByBinarySearch(
            this.timeline,
            comment,
            commentComparator
        );
        if (index <= this.position) {
            this.position++;
        }
        this.dispatchEvent('insert');
    }

    clear() {
        while (this.runline.length > 0) {
            this.runline[0].finish();
        }
        this.dispatchEvent('clear');
    }

    setBounds() {
        this.width = this.stage.offsetWidth;
        this.height = this.stage.offsetHeight;
        this.dispatchEvent('resize');
        for (const allocator of Object.values(this.spaceAllocators)) {
            allocator.setBounds(this.width, this.height);
        }
        // Update 3d perspective
        this.stage.style.perspective =
            this.width / Math.tan((55 * Math.PI) / 180) / 2 + 'px';
        this.stage.style.perspective =
            this.width / Math.tan((55 * Math.PI) / 180) / 2 + 'px';
    }

    init() {
        this.setBounds();
        if (!this.factory) {
            this.factory = CommentFactory.defaultCssRender();
        }
        if (!this.filter) {
            this.filter = () => true;
        }
        if (!this.preprocessor) {
            this.preprocessor = (c) => c;
        }
    }

    bindToVideo(video: HTMLVideoElement) {
        video.addEventListener('play', () => this.start());
        video.addEventListener('pause', () => this.stop());
        video.addEventListener('timeupdate', () => {
            this.time(Math.floor(1000 * video.currentTime));
        });

        const resize = () => {
            const d = calcVideoRenderedSize(video);
            if (d.filter((v) => !v).length > 0) {
                console.warn(
                    `[CCL2][Core] invalid video size [${d}], waiting for retrying`
                );
                setTimeout(() => resize(), 200);
            } else {
                this.stage.style.width = d[0] + 'px';
                this.stage.style.height = d[1] + 'px';
                this.stage.style.margin = 'auto';
                console.debug(`[CCL2][Core] video resize [${d}]`);
                this.setBounds();
            }
        };
        new ResizeObserver(() => resize()).observe(video);
        console.debug('[CCL2][Core] bind to %o', { video });
    }

    onTimerEvent(time: number, manager: CommentManager) {
        for (let i = 0; i < manager.runline.length; i++) {
            manager.runline[i].time(time);
        }
    }

    time(time: number) {
        time = time - 1;
        if (
            this.position >= this.timeline.length ||
            Math.abs(this.lastTime - time) >= this.options.seekTrigger
        ) {
            this.seek(time);
            this.lastTime = time;
            if (this.timeline.length <= this.position) {
                return;
            }
        } else {
            this.lastTime = time;
        }
        const batch = [];
        for (; this.position < this.timeline.length; this.position++) {
            if (this.timeline[this.position]['stime'] <= time) {
                if (
                    this.options.limit > 0 &&
                    this.runline.length + batch.length >= this.options.limit
                ) {
                    continue; // Skip comments but still move the position pointer
                }
                if (this.filter(this.timeline[this.position])) {
                    batch.push(this.timeline[this.position]);
                }
            } else {
                break;
            }
        }
        if (batch.length > 0) {
            this.send(batch);
        }
    }

    private preprocess(data: CommentData) {
        if (data.mode === CommentType.Code) {
            // This comment is not managed by the comment manager
            console.log(data);
            // if (this.scripting) {
            //     console.log(this.scripting.eval(data.code));
            // }
            return null;
        }
        if (this.preprocessor) {
            data = this.preprocessor(data);
        }
        return data;
    }

    // ====================================================================== //

    send(data: CommentData[]) {
        data.map((c) => this.preprocess(c))
            .filter((c) => c !== null)
            .map((c) => this.factory.create(this, c))
            .forEach((c) => {
                const allocator = this.spaceAllocators[c.mode];
                if (allocator) {
                    allocator.add(c);
                }
                this.dispatchEvent('enterComment', c);
                this.runline.push(c);
            });
    }

    finish(comment: IComment) {
        this.dispatchEvent('exitComment', comment);
        this.stage.removeChild(comment.element);
        const index = this.runline.indexOf(comment);
        if (index >= 0) {
            this.runline.splice(index, 1);
        }
        const allocator = this.spaceAllocators[comment.mode];
        if (allocator) {
            allocator.remove(comment);
        }
    }

    // ====================================================================== //

    addEventListener(event: string, listener: (data: any) => void) {
        if (typeof this.listeners[event] !== 'undefined') {
            this.listeners[event].push(listener);
        } else {
            this.listeners[event] = [listener];
        }
    }

    dispatchEvent(event: string, data?: any) {
        if (typeof this.listeners[event] !== 'undefined') {
            console.log('[CCL2][Core] dispatch event "%s": %o', event, data);
            for (let i = 0; i < this.listeners[event].length; i++) {
                try {
                    this.listeners[event][i](data);
                } catch (e) {
                    console.error(e.stack);
                }
            }
        }
    }

    // ====================================================================== //

    rescale() {
        throw new Error('Not yet implemented');
    }
}

import { IComment } from '@api/comment.js';

export interface CCLOptions {
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

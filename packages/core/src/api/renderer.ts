import { IComment } from '@api/comment.js';

export interface ISpaceAllocator {
    add(c: IComment): void;
    remove(c: IComment): void;
    setBounds(w: number, h: number): void;
}

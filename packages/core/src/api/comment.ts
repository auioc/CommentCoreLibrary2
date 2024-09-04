export const enum CommentType {
    TopScrolling = 1,
    BottomScrolling = 2,
    BottomStatic = 4,
    TopStatic = 5,
    TopReverse = 6,
    Animation = 7,
    /** Not yet implemented */
    Code = 8,
    /** Reserved */
    Zoome = 9,
    /** Reserved */
    Image = 17,
    /** Reserved */
    CanvasOrSVG = 18,
    /** Reserved */
    DrawCommand = 19,
    /** Reserved */
    Motion = 20,
    /** Reserved */
    Subtitles = 21,
}

interface BasicComment {
    text: string;
    mode: CommentType;
    stime: number;
    size: number;
    color: number;
}

interface CommentDisplayExtra {
    border?: boolean;
    dur?: number;
    shadow?: boolean;
    font?: string;
    opacity?: number;
}

interface CommentMetadata {
    dbid?: number;
    date?: number;
    pool?: number;
    hash?: string;
}

interface CommentPosition {
    x?: number;
    y?: number;
    rX?: number;
    rY?: number;
    rZ?: number;
    align?: number;
    axis?: number;
    position?: string; // TODO
    transform?: number[];
}

export interface IMotion {
    from: number;
    to: number;
    delay?: number;
    dur?: number;
    ttl?: number;
    easing?: (t: number, b: number, c: number, d: number) => number;
}

export type MotionRecord = Record<string, IMotion>;

interface CommentAnimation {
    movable?: boolean;
    motion?: MotionRecord[];
    alphaMotion?: IMotion; // TODO
}

export interface CommentData
    extends BasicComment,
        CommentDisplayExtra,
        CommentMetadata,
        CommentPosition,
        CommentAnimation {
    code?: string; // TODO
}

export interface IComment extends CommentData {
    element: any;
    ttl: number;
    cindex: number;
    bottom: number;
    right: number;
    width: number;
    height: number;

    /**
     * Updates the comment life by subtracting t from ttl
     * @param t - difference in time
     */
    time(t: number): void;

    /**
     * Update the comment's position based on the time.
     * This is called by time()
     */
    update(): void;

    /**
     * Invalidate the coordinates and dimensions of the
     * current comment object
     */
    invalidate(): void;

    /**
     * Perform an animation alongside the update
     */
    animate(): void;

    /**
     *  Remove the comment from display
     */
    finish(): void;

    /**
     * Called when the outside container stops
     */
    stop(): void;
}

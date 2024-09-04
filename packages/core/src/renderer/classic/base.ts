import {
    CommentData,
    CommentType,
    IComment,
    IMotion,
    MotionRecord,
} from '@api/comment.js';
import { Tuple } from '@api/types.js';
import { Matrix3D } from '@utils/matrix3d.js';
import { ICommentManager } from 'comment/manager.js';

const linearEasing = (t: number, b: number, c: number, d: number) => {
    return (t * c) / d + b;
};

export class CoreComment implements IComment {
    public mode = CommentType.TopScrolling;
    public stime: number = 0;
    public text: string = '';
    public ttl: number = 4000;
    public dur: number = 4000;
    public cindex: number = -1;

    public motion: MotionRecord[] = [];
    public movable: boolean = true;

    private _curMotion: number;
    private _motionStart: Array<number>;
    private _motionEnd: Array<number>;
    private _alphaMotion: IMotion = null;

    public _x: number;
    public _y: number;

    /**
     * Absolute coordinates. Use absolute coordinates if true otherwise use percentages.
     * @type {boolean} use absolute coordinates or not (default true)
     */
    public absolute: boolean = true;
    /**
     * Alignment
     * @type {number} 0=tl, 2=bl, 1=tr, 3=br
     */
    public align: number = 0;
    /**
     * Axis
     * @type {number} 0=dr, 1=dl, 2=ur, 3=ul
     */
    public axis: number = 0;

    public _alpha: number = 1;
    public _size: number = 25;
    private _width: number;
    private _height: number;
    private _color: number = 0xffffff;
    private _border: boolean = false;
    private _shadow: boolean = true;
    private _font: string = '';
    private _transform: Matrix3D = null;

    public parent: ICommentManager;
    public element: HTMLDivElement;

    constructor(parent: ICommentManager, init: CommentData) {
        if (!parent) {
            throw new Error('Comment not bound to comment manager.');
        } else {
            this.parent = parent;
        }
        if (init.hasOwnProperty('stime')) {
            this.stime = init['stime'];
        }
        if (init.hasOwnProperty('mode')) {
            this.mode = init['mode'];
        } else {
            this.mode = 1;
        }
        if (init.hasOwnProperty('dur')) {
            this.dur = init['dur'];
            this.ttl = this.dur;
        }
        this.dur *= this.parent.options.global.scale;
        this.ttl *= this.parent.options.global.scale;
        if (init.hasOwnProperty('text')) {
            this.text = init['text'];
        }
        if (init.hasOwnProperty('motion')) {
            this._motionStart = [];
            this._motionEnd = [];
            this.motion = init['motion'];
            let head = 0;
            for (let i = 0; i < init['motion'].length; i++) {
                this._motionStart.push(head);
                let maxDur = 0;
                for (const k in init['motion'][i]) {
                    const m = <IMotion>init['motion'][i][k];
                    maxDur = Math.max(m.dur + m.delay, maxDur);
                    if (m.easing === null || m.easing === undefined) {
                        init['motion'][i][k]['easing'] = linearEasing;
                    }
                }
                head += maxDur;
                this._motionEnd.push(head);
            }
            this._curMotion = 0;
        }
        if (init.hasOwnProperty('color')) {
            this._color = init['color'];
        }
        if (init.hasOwnProperty('size')) {
            this._size = init['size'];
        }
        if (init.hasOwnProperty('border')) {
            this._border = init['border'];
        }
        if (init.hasOwnProperty('opacity')) {
            this._alpha = init['opacity'];
        }
        if (init.hasOwnProperty('alphaMotion')) {
            this._alphaMotion = init['alphaMotion'];
        }
        if (init.hasOwnProperty('font')) {
            this._font = init['font'];
        }
        if (init.hasOwnProperty('x')) {
            this._x = init['x'];
        }
        if (init.hasOwnProperty('y')) {
            this._y = init['y'];
        }
        if (init.hasOwnProperty('shadow')) {
            this._shadow = init['shadow'];
        }
        if (init.hasOwnProperty('align')) {
            this.align = init['align'];
        }
        if (init.hasOwnProperty('axis')) {
            this.axis = init['axis'];
        }
        if (init.hasOwnProperty('transform')) {
            this._transform = new Matrix3D(<any>init['transform']);
        }
        if (init.hasOwnProperty('position')) {
            if (init['position'] === 'relative') {
                this.absolute = false;
                if (this.mode < 7) {
                    console.warn('Using relative position for CSA comment.');
                }
            }
        }
    }

    protected toggleClass(className: string, toggle: boolean = false): void {
        if (!this.element) {
            return;
        }
        if (this.element.classList) {
            this.element.classList.toggle(className, toggle);
        } else {
            // Fallback to traditional method
            const classList: string[] = this.element.className.split(' ');
            const index = classList.indexOf(className);
            if (index >= 0 && !toggle) {
                classList.splice(index, 1);
                this.element.className = classList.join(' ');
            } else if (index < 0 && toggle) {
                classList.push(className);
                this.element.className = classList.join(' ');
            }
        }
    }

    /**
     * Initializes the DOM element (or canvas) backing the comment
     * This method takes the place of 'initCmt' in the old CCL
     */
    public init(recycle: IComment = null): void {
        if (recycle !== null) {
            this.element = <HTMLDivElement>recycle.element;
        } else {
            this.element = document.createElement('div');
        }
        this.element.className = this.parent.options.global.className;
        this.element.appendChild(document.createTextNode(this.text));
        this.element.textContent = this.text;
        this.element.innerText = this.text;
        this.size = this._size;
        if (this._color != 0xffffff) {
            this.color = this._color;
        }
        this.shadow = this._shadow;
        if (this._border) {
            this.border = this._border;
        }
        if (this._font !== '') {
            this.font = this._font;
        }
        if (this._x !== undefined) {
            this.x = this._x;
        }
        if (this._y !== undefined) {
            this.y = this._y;
        }
        if (this._alpha !== 1 || this.parent.options.global.opacity < 1) {
            this.alpha = this._alpha;
        }
        if (this._transform !== null && !this._transform.isIdentity()) {
            this.transform = this._transform.flatArray;
        }
        if (this.motion.length > 0) {
            // Force a position update before doing anything
            this.animate();
        }
    }

    get x(): number {
        if (this._x === null || this._x === undefined) {
            if (this.axis % 2 === 0) {
                if (this.align % 2 === 0) {
                    this._x = this.element.offsetLeft;
                } else {
                    this._x = this.element.offsetLeft + this.width;
                }
            } else {
                if (this.align % 2 === 0) {
                    this._x = this.parent.width - this.element.offsetLeft;
                } else {
                    this._x =
                        this.parent.width -
                        this.element.offsetLeft -
                        this.width;
                }
            }
        }
        if (!this.absolute) {
            return this._x / this.parent.width;
        }
        return this._x;
    }

    get y(): number {
        if (this._y === null || this._y === undefined) {
            if (this.axis < 2) {
                if (this.align < 2) {
                    this._y = this.element.offsetTop;
                } else {
                    this._y = this.element.offsetTop + this.height;
                }
            } else {
                if (this.align < 2) {
                    this._y = this.parent.height - this.element.offsetTop;
                } else {
                    this._y =
                        this.parent.height -
                        this.element.offsetTop -
                        this.height;
                }
            }
        }
        if (!this.absolute) {
            return this._y / this.parent.height;
        }
        return this._y;
    }

    get bottom(): number {
        const sameDirection =
            Math.floor(this.axis / 2) === Math.floor(this.align / 2);
        return this.y + (sameDirection ? this.height : 0);
    }

    get right(): number {
        const sameDirection = this.axis % 2 === this.align % 2;
        return this.x + (sameDirection ? this.width : 0);
    }

    get width(): number {
        if (this._width === null || this._width === undefined) {
            this._width = this.element.offsetWidth;
        }
        return this._width;
    }

    get height(): number {
        if (this._height === null || this._height === undefined) {
            this._height = this.element.offsetHeight;
        }
        return this._height;
    }

    get size(): number {
        return this._size;
    }

    get color(): number {
        return this._color;
    }

    get alpha(): number {
        return this._alpha;
    }

    get border(): boolean {
        return this._border;
    }

    get shadow(): boolean {
        return this._shadow;
    }

    get font(): string {
        return this._font;
    }

    get transform(): Tuple<number, 16> {
        return this._transform.flatArray;
    }

    set x(x: number) {
        this._x = x;
        if (!this.absolute) {
            this._x *= this.parent.width;
        }
        if (this.axis % 2 === 0) {
            this.element.style.left =
                this._x + (this.align % 2 === 0 ? 0 : -this.width) + 'px';
        } else {
            this.element.style.right =
                this._x + (this.align % 2 === 0 ? -this.width : 0) + 'px';
        }
    }

    set y(y: number) {
        this._y = y;
        if (!this.absolute) {
            this._y *= this.parent.height;
        }
        if (this.axis < 2) {
            this.element.style.top =
                this._y + (this.align < 2 ? 0 : -this.height) + 'px';
        } else {
            this.element.style.bottom =
                this._y + (this.align < 2 ? -this.height : 0) + 'px';
        }
    }

    set width(w: number) {
        this._width = w;
        this.element.style.width = this._width + 'px';
    }

    set height(h: number) {
        this._height = h;
        this.element.style.height = this._height + 'px';
    }

    set size(s: number) {
        this._size = s;
        this.element.style.fontSize = this._size + 'px';
    }

    set color(c: number) {
        this._color = c;
        let color: string = c.toString(16);
        color =
            color.length >= 6
                ? color
                : new Array(6 - color.length + 1).join('0') + color;
        this.element.style.color = '#' + color;
        if (this._color === 0) {
            this.toggleClass('reverse-shadow', true);
        }
    }

    set alpha(a: number) {
        this._alpha = a;
        this.element.style.opacity =
            Math.min(this._alpha, this.parent.options.global.opacity) + '';
    }

    set border(b: boolean) {
        this._border = b;
        if (this._border) {
            this.element.style.border = '1px solid #00ffff';
        } else {
            this.element.style.border = 'none';
        }
    }

    set shadow(s: boolean) {
        this._shadow = s;
        if (!this._shadow) {
            this.toggleClass('no-shadow', true);
        }
    }

    set font(f: string) {
        this._font = f;
        if (this._font.length > 0) {
            this.element.style.fontFamily = this._font;
        } else {
            this.element.style.fontFamily = '';
        }
    }

    set transform(array: Tuple<number, 16>) {
        this._transform = new Matrix3D(array);
        if (this.element !== null) {
            this.element.style.transform = this._transform.toCss();
        }
    }

    /**
     * Moves the comment by a number of milliseconds. When
     * the given parameter is greater than 0 the comment moves
     * forward. Otherwise it moves backwards.
     * @param time - elapsed time in ms
     */
    public time(time: number): void {
        this.ttl -= time;
        if (this.ttl < 0) {
            this.ttl = 0;
        }
        if (this.movable) {
            this.update();
        }
        if (this.ttl <= 0) {
            this.finish();
        }
    }

    /**
     * Update the comment's position depending on its mode and
     * the current ttl/dur values.
     */
    public update(): void {
        this.animate();
    }

    /**
     * Invalidate the comment position.
     */
    public invalidate(): void {
        this._x = null;
        this._y = null;
        this._width = null;
        this._height = null;
    }

    /**
     * Executes a motion object
     * @param currentMotion - motion object
     * @private
     */
    private _execMotion(currentMotion: MotionRecord, time: number): void {
        for (const prop in currentMotion) {
            if (currentMotion.hasOwnProperty(prop)) {
                const m = currentMotion[prop];
                // TODO
                // @ts-expect-error
                this[prop] = m.easing(
                    Math.min(Math.max(time - m.delay, 0), m.dur),
                    m.from,
                    m.to - m.from,
                    m.dur
                );
            }
        }
    }

    /**
     * Update the comment's position depending on the applied motion
     * groups.
     */
    public animate(): void {
        if (this._alphaMotion) {
            this.alpha =
                ((this.dur - this.ttl) *
                    (this._alphaMotion['to'] - this._alphaMotion['from'])) /
                    this.dur +
                this._alphaMotion['from'];
        }
        if (this.motion.length === 0) {
            return;
        }
        const ttl: number = Math.max(this.ttl, 0);
        const time: number =
            this.dur - ttl - this._motionStart[this._curMotion];
        this._execMotion(this.motion[this._curMotion], time);
        if (this.dur - ttl > this._motionEnd[this._curMotion]) {
            this._curMotion++;
            if (this._curMotion >= this.motion.length) {
                this._curMotion = this.motion.length - 1;
            }
            return;
        }
    }

    /**
     * Notify the comment to stop. This has no effect if the comment
     * is driven by a timer.
     */
    public stop(): void {
        // Do nothing
    }

    /**
     * Remove the comment and do some cleanup.
     */
    public finish(): void {
        this.parent.finish(this);
    }

    /**
     * Returns string representation of comment
     * @returns {string}
     */
    public toString(): string {
        return [
            '[',
            this.stime,
            '|',
            this.ttl,
            '/',
            this.dur,
            ']',
            '(',
            this.mode,
            ')',
            this.text,
        ].join('');
    }
}

import { IComment } from '@api/comment.js';
import { ScrollComment } from 'renderer/classic/scroll.js';

export class CssScrollComment extends ScrollComment {
    // Marker for whether we need to re-create the CSS or not
    private dirtyCSS: boolean = true;

    public init(recycle: IComment = null): void {
        super.init(recycle);
        this.toggleClass('css-optimize', true);
    }

    set x(x: number) {
        if (this._x !== null && typeof this._x === 'number') {
            // This is run when starting
            var dx: number = x - this._x;
            this._x = x;

            this.element.style.transform =
                'translateX(' + (this.axis % 2 === 0 ? dx : -dx) + 'px)';
        } else {
            // This is run when stopping
            this._x = x;
            if (!this.absolute) {
                this._x *= this.parent.width;
            }
            // Got the x-value, now figure out where things are
            if (this.axis % 2 === 0) {
                // x-axis towards right
                this.element.style.left =
                    this._x + (this.align % 2 === 0 ? 0 : -this.width) + 'px';
            } else {
                // x-axis towards left
                this.element.style.right =
                    this._x + (this.align % 2 === 0 ? -this.width : 0) + 'px';
            }
        }
    }

    get x(): number {
        // X always goes from {parent.width to -this.width}
        return (
            (this.ttl / this.dur) * (this.parent.width + this.width) -
            this.width
        );
    }

    public update(): void {
        if (this.dirtyCSS) {
            // Start moving
            this.element.style.transition =
                'transform ' + this.ttl + 'ms linear';
            this.x = -this.width;
            this.dirtyCSS = false;
        }
    }

    public invalidate(): void {
        super.invalidate();
        this.dirtyCSS = true;
    }

    /**
     * Override the toplevel stop to actually stop the CSS.
     */
    public stop(): void {
        super.stop();
        this.element.style.transition = '';
        // This clears translation (sets translate to 0px)
        this.x = this._x;
        // Set to null to force writing an absolute x position
        this._x = null;
        // Write down the current expected x as absolute
        this.x = this.x;
        // Make the CSS dirty so that next update will start the movement
        this.dirtyCSS = true;
    }
}

import { Matrix, Tuple } from '@api/types.js';

const cos = Math.cos;
const sin = Math.sin;
const deg2rad = Math.PI / 180;

type Tuple16 = Tuple<number, 16>;
type Matrix4x4 = Matrix<number, 4, 4>;

export class Matrix3D {
    static identity = () => {
        return new Matrix3D([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ]);
    };

    static createRotationMatrix = (
        xRot: number,
        yRot: number,
        zRot: number
    ) => {
        // Courtesy of @StarBrilliant, re-adapted for general case
        // TODO: add support for xRot
        var yr = yRot * deg2rad;
        var zr = zRot * deg2rad;
        var matrix = [
            [cos(yr) * cos(zr), cos(yr) * sin(zr), sin(yr), 0],
            [-sin(zr), cos(zr), 0, 0],
            [-sin(yr) * cos(zr), -sin(yr) * sin(zr), cos(yr), 0],
            [0, 0, 0, 1],
        ]
            .flat()
            // Do some rounding
            .map((v) => Math.round(v * 1e10) * 1e-10);

        return new Matrix3D(<Tuple16>matrix);
    };

    static createScaleMatrix = (
        xScale: number,
        yScale: number,
        zScale: number
    ) => {
        return new Matrix3D([
            [xScale, 0, 0, 0],
            [0, yScale, 0, 0],
            [0, 0, zScale, 0],
            [0, 0, 0, 1],
        ]);
    };

    // ====================================================================== //

    private arr: Tuple16 = null;

    constructor(input: Tuple16);
    constructor(input: Matrix4x4);
    constructor(input: any) {
        if (!Array.isArray(input)) {
            throw new Error('Not an array. Cannot construct matrix.');
        }

        if (input.length === 16) {
            this.arr = <Tuple16>input;
            return;
        }

        if (input.length === 4) {
            let ok = true;
            for (const row of input) {
                if (Array.isArray(row)) {
                    if (row.length === 4) {
                        continue;
                    }
                }
                ok = false;
            }
            if (ok) {
                this.arr = <Tuple16>input.flat();
                return;
            }
        }

        throw new Error('Illegal matrix. Matrix3D should be 4x4 matrix.');
    }

    get flatArray(): Tuple16 {
        return this.arr.slice() as Tuple16;
    }

    set flatArray(array: Tuple16) {
        throw new Error('Not permitted. Matrices are immutable.');
    }

    /**
     * Check equality to identity matrix
     * @returns {boolean} indicates whether this is the identity matrix
     */
    public isIdentity(): boolean {
        return this.equals(Matrix3D.identity());
    }

    /**
     * Computes dot product of two Matrix3D objects
     * @param {Matrix3D} input matrix b to compute dot product on
     * @returns {Matrix3D} dot product
     */
    public dot(matrix: Matrix3D): Matrix3D {
        var a = this.arr.slice();
        var b = matrix.arr.slice();
        var res: Tuple16 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                for (var k = 0; k < 4; k++) {
                    res[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
                }
            }
        }
        return new Matrix3D(res);
    }

    /**
     * Check to see if two matrices are the same
     * @param {Matrix3D} input matrix b to compare to
     * @returns {boolean} indicator of whether two matrices are the same
     */
    public equals(matrix: Matrix3D): boolean {
        for (var i = 0; i < 16; i++) {
            if (this.arr[i] !== matrix.arr[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * Writes the matrix out to CSS compatible format
     * @returns {string} representation of matrix
     */
    public toCss(): string {
        var matrix = this.arr.slice();
        for (var i = 0; i < matrix.length; i++) {
            if (Math.abs(matrix[i]) < 0.000001) {
                matrix[i] = 0;
            }
        }
        return 'matrix3d(' + matrix.join(',') + ')';
    }
}

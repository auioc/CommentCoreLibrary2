export interface Delegate<T> {
    resolve(): T; // TODO name?
}

export type Tuple<
    T,
    N extends number = 1,
    R extends T[] = []
> = R['length'] extends N ? R : Tuple<T, N, [...R, T]>;

/**
 * @param M rows
 * @param N columns
 */
export type Matrix<
    T, //
    M extends number = 1,
    N extends number = 1
> = Tuple<Tuple<T, N>, M>;

export type Flatten<T extends any[]> = T extends [infer F, ...infer R]
    ? F extends unknown[]
        ? Flatten<[...F, ...Flatten<R>]>
        : [F, ...Flatten<R>]
    : [];

const a: Matrix<number, 2, 4> = [
    [1, 2, 3, 4],
    [3, 4, 5, 6],
];

type B = Flatten<typeof a>;

/**
 * Performs binary search on the array
 * Note: The array MUST ALREADY BE SORTED. Some cases will fail but we don't
 * guarantee that we can catch all cases.
 *
 * @param arr - array to search on
 * @param target - element to search for (may not be present)
 * @param compartor - function comparator (a, b). Returns positive value if a > b
 * @return index of the element (or index of the element if it were in the array)
 **/
export function binarySearch<T, E>(
    arr: T[],
    target: E,
    compartor: (target: E, current: T) => number
) {
    if (!Array.isArray(arr)) {
        throw new Error('Binary search can only be run on arrays');
    }
    if (arr.length === 0) {
        return 0;
    }
    if (compartor(target, arr[0]) < 0) {
        return 0;
    }
    if (compartor(target, arr[arr.length - 1]) >= 0) {
        return arr.length;
    }
    let low = 0;
    let i = 0;
    let count = 0;
    let high = arr.length - 1;
    while (low <= high) {
        i = Math.floor((high + low + 1) / 2);
        count++;
        if (
            compartor(target, arr[i - 1]) >= 0 &&
            compartor(target, arr[i]) < 0
        ) {
            return i;
        } else if (compartor(target, arr[i - 1]) < 0) {
            high = i - 1;
        } else if (compartor(target, arr[i]) >= 0) {
            low = i;
        } else {
            throw new Error(
                'Program Error. Inconsistent comparator or unsorted array!'
            );
        }
        if (count > 1500) {
            throw new Error(
                'Iteration depth exceeded. Inconsistent comparator or astronomical dataset!'
            );
        }
    }
    return -1;
}

/**
 * Insert an element into its position in the array signified by binary search
 *
 * @param arr - array to insert into
 * @param target - element to insert
 * @param compartor - comparator {@link binarySearch}
 * @return index that the element was inserted to.
 **/
export function insertByBinarySearch<T>(
    arr: T[],
    target: T,
    compartor: (a: T, b: T) => number
) {
    const index = binarySearch(arr, target, compartor);
    arr.splice(index, 0, target);
    return index;
}

/* utility functions used in tests. Unfortunately we cannot use export /import in the browser
 * because of a weird security rule.*/

/**
 * Copyright 2012 Akseli Palén.
 * Created 2012-07-15.
 * Licensed under the MIT license.
 */
export function k_combinations(set, k) {
    var i, j, combs, head, tailcombs;
    if (k > set.length || k <= 0) {
        return [];
    }
    if (k == set.length) {
        return [set];
    }
    if (k == 1) {
        combs = [];
        for (i = 0; i < set.length; i++) {
            combs.push([set[i]]);
        }
        return combs;
    }
    combs = [];
    for (i = 0; i < set.length - k + 1; i++) {
        head = set.slice(i, i+1);
        tailcombs = k_combinations(set.slice(i + 1), k - 1);
        for (j = 0; j < tailcombs.length; j++) {
            combs.push(head.concat(tailcombs[j]));
        }
    }
    return combs;
}
function combinations(set) {
    var k, i, combs, k_combs;
    combs = [];
    for (k = 1; k <= set.length; k++) {
        k_combs = k_combinations(set, k);
        for (i = 0; i < k_combs.length; i++) {
            combs.push(k_combs[i]);
        }
    }
    return combs;
}

// https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
export const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

export const posits = [0, 1, 2, 3, 4]; // positions along a line
export const dims = [0, 1, 2, 3]; // indexes of the 4 dimensions.
export const strides = [125, 25, 5, 1]; // strides along a linear dimension.

export function pos_coords(pos){ // most significant to least significant
    let x1, x2, y1, y2;
    y1 = Math.floor(pos/125);
    pos -= y1 * 125;
    y2 = Math.floor(pos / 25);
    pos -= y2 * 25;
    x1 = Math.floor(pos / 5);
    pos -= x1 * 5;
    x2 = pos;
    return [y1, y2, x1, x2];
}

export function elements_at(target, positions){
    let result = [];
    for (let ii = 0; ii < positions.length; ii++){
        result.push(target[positions[ii]]);
    }
    return result;
}


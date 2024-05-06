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

export function other_player(player){
		if (player == 'x'){
				return 'o';
		}
		return 'x';
}

/* store counts of letters along lines. Counts member is indexed as 'xo'.
 * counts from a player's perspecive is 'ut' for us/them e.g. prom o perspective
 * ot_counts('31') is the number of lines o has 3 and x has 1, corresponing to counts['13']
 */

export class LetterCounts {
		constructor(counts) {
				if (counts) {
						this.counts = structuredClone(counts);
				} else {
						this.counts = Object();
						for (let ii = 0; ii < 6; ii++){
								for (let iii = 0; iii < 6 - ii; iii++){
										this.counts['' + ii + '' + iii] = 0;
								}
						}
				}
		}
		adj_counts(grid, base, stride, letter){
			let xs = 0;
			let os = 0;
			for (let pos=base; pos < base + stride * 5; pos += stride){
				if (grid[pos] == 'x'){
					xs++;
				}
				if (grid[pos] == 'o'){
					os++;
				}
			}
			let idx = '' + xs + '' + os;
			this.counts[idx] += 1;
			if (letter == 'x'){
					xs -= 1;
			} else {
					os -= 1;
			}
			this.counts['' + xs + '' + os] -= 1;
		}
		ut_counts(player, idx){
				if (player === 'x'){
						return this.counts[idx];
				}
				return this.counts[idx[1] + idx[0]];
		}
}
// score counts from the point of view of player, after that player has moved.
// It matters because after a player has moved, if the other player still has a 4 move line he is screwed,
// but if the player has just1 4 move line it is not all that special.
export function score_counts(letter_counts, player){
		function ut(idx){
				return letter_counts.ut_counts(player, idx);
		}
		if (ut('50') > 0) {
				return 2000000000;
		}
		if (ut('04') > 0) {
				return -1000000000;
		}
		if (ut('40') > 1) {
				return 1000000000;
		}
		// adjust these as seems appropriate
		return 1000 * ut('40' ) + 600 * ut('30') + 200 * ut('20' ) + 100 * ut('10') -
				(600 * ut('03') + 200 * ut('02') + 100 * ut('01'));

}

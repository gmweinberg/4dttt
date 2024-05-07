/* The grid is a 5 x 5 x 5 x 5 array (625 total) squares, with values "x", "o" or "".
 * We view them as a 5 x 5 array of 5 x 5 planes.
 * Wr call the dimensions x1, x2, y1, y2 with the 2s being the diemsion inside the plane and
 * the 1s the dimeension of the plane.
 */

/* Unfortunately javascript in the browser does not support modules for local files, so
 * since I want people to be able to run this locally without a web server, we must put all the js into one
 * big file. I'll comment where copied code came from.
 *
 */

/* code copied from https://stackoverflow.com/questions/37075180/combinations-of-size-n-from-an-array */

/**
 * Copyright 2012 Akseli Palén.
 * Created 2012-07-15.
 * Licensed under the MIT license.
 */
function k_combinations(set, k) {
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

/* end Akseli Palén code */

// https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));


// multiply  2 arrays of equal length, return an array of the products element by element
function product(ar1, ar2){
	let result = [];
	for (let ii = 0; ii < ar1.length; ii++){
		result.push(ar1[ii] * ar2[ii]);
	}
	return result;
}

// given a target array and a list of indices, return a new array of the elements at the 
// index positions
function elements_at(target, positions){
	let result = [];
	for (let ii = 0; ii < positions.length; ii++){
		result.push(target[positions[ii]]);
	}
	return result;
}

function zip(ar1, ar2){
    let result = 0;
    for (let ii =0; ii < ar1.length; ii++){
        result += ar1[ii] * ar2[ii]
    }
    return result;
}

function grid_pos(y1, y2, x1, x2){
	return y1 * 125 + y2 * 25 + x1 * 5 + x2;
}

function pos_coords(pos){ // most significant to least significant
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

const dims = [0, 1, 2, 3];
const strides = [125, 25, 5, 1];
const posits = [0, 1, 2, 3, 4]; // possible positions along a dimension

function compli_coords(coords, direction){
    let result = [];
    for (let ii = 0; ii < coords.length; ii++){
        if (direction[ii] > 0){
            result.push(coords[ii]);
        } else {
            result.push(4 - coords[ii]);
        }
    }
    return result;
}

function get_paths(pos){
    let result = [];
    let coords = pos_coords(pos);
    // do the stright line paths separately. All points are in 4.
    for (let stridei = 0; stridei < strides.length; stridei++){
            let stride = strides[stridei];
            let steps = Math.floor(pos / stride);
            result.push([pos - steps * stride, stride]);
    }
    for (let var_dimc = 2; var_dimc < 5; var_dimc++){
        let all_var_dims = k_combinations(dims, var_dimc);
        for (let var_dimi = 0; var_dimi < all_var_dims.length; var_dimi++){
            let var_dims = all_var_dims[var_dimi];
            let other_dims = var_dims.slice(1);
            let base_stride = strides[var_dims[0]];
            // console.log('base_stride', base_stride);
            let all_dirs;
            if (other_dims.length == 1){
                all_dirs = [[1], [-1]];
            } else {
                all_dirs = cartesian(...Array(other_dims.length).fill([1, -1]));
            }
            for (let dirsi = 0; dirsi < all_dirs.length; dirsi++){
                //console.log("others", other_dims, "dirs", all_dirs[dirsi]);
                let comps = compli_coords(elements_at(coords, other_dims), all_dirs[dirsi]);
                if (comps.every(function(elm)  { return elm === coords[var_dims[0]]} )){
                // console.log("ms", coords[var_dims[0]], "others", other_dims, "dirs",  all_dirs[dirsi], "comps", comps);
                    let stride = base_stride;
                    for (let other_dimsi = 0; other_dimsi < other_dims.length; other_dimsi++){
                        stride += strides[other_dims[other_dimsi]] * all_dirs[dirsi][other_dimsi];
                        // console.log(strides[other_dims[other_dimsi]], all_dirs[dirsi][other_dimsi]);
                    }
                    let base = pos - stride * coords[[var_dims[0]]];
                    result.push([base, stride])
                }
            }
        }
    }
    return result;

}


// check if there is a win along the path with base, stride. If so returns letter of win (x or o)
function check_win_line(grid, base, stride){
	let letter = "?";
	for (let pos = base; pos < base + stride * 5; pos += stride){
		//console.log("pos", pos, "grid[pos]", grid[pos]);
		if (grid[pos] == ""){ //blank
			break;
		}
		// console.log("letter", letter, "at pos", pos);
		if (letter == "?"){
			letter = grid[pos];
			continue;
		}
		if (grid[pos] != letter){
			break;
		}
		if (pos == base + stride * 4){
			console.log("winner", base, stride);
			return letter;
		}
	}
}

function other_player(player){
        if (player == 'x'){
                return 'o';
        }
        return 'x';
}

class LetterCounts {
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
function score_counts(letter_counts, player){
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


/*To win a game we get five in a row with 1, 2, 3 or 4 dimensions changing, and the others (if any) statying constant.
 * A win is characerized by a base (lowest grid position) and a stride.
 * A change along a dimension changes 1, 5, 25, or 125. If more than one dimension changes,
 * all except the most significant change + or -.
 * A diagonal win will have a stride that is a combo of + or - a combo of those numbers,
 * depending on how diagonal.
 * */


function get_text_pos(coords){
	let [y1, y2, x1, x2] = coords;
	const ps = pb + 5 * sqs + 6 * sqb; // plane size
	const xoff = 14;
	const yoff = 20;
	const x = x1 * ps + (sqs + sqb) * x2 + xoff;
	const y = y1 * ps + (sqs + sqb) * y2 + yoff;
	return [x, y];
}

class GameState {
	constructor(mode) {
		this.mode = mode;
		this.grid =  Array(625).fill(''),
		this.moves= [];
		this.pom = 'x'; // player on move
		this.done = false;
		this.winner = null;
		this.win_line = null;
		this.computer_moving = false;
	}
	toggle_pom() {
		this.pom = other_player(this.pom);
	}
	append_move(pos) {
			//console.log("appending move?");
			this.grid[pos] = this.pom;
			this.moves.push(pos);
			let paths = get_paths(pos);
			for (let pathi = 0; pathi < paths.length; pathi++){
					let [base, stride] = paths[pathi];
					let winner = check_win_line(this.grid, base, stride);
					if (winner){
							console.log("winner", this.pom);
							this.winner = this.pom;
							this.done = true;
							this.win_line = [base, stride];
							break;
					}
			}
			if (!this.winner){
				this.toggle_pom();
			}
	}
    undo_move() {
			//console.log("undoing move");
			if (this.moves.length == 0){
					return;
			}
			const pos = this.moves.pop();
			this.grid[pos] = "";
			console.log("moves", this.moves);
			this.winner = null;
			this.win_line = null;
			this.done = false;
			this.toggle_pom();
	}
}

function get_random_move(grid, pom){
		let maybe = Math.floor(Math.random() * 625);
		while (grid[maybe] != ''){
				maybe = Math.floor(Math.random() * 625);
		}
		return maybe;
}

function get_2ply_move(grid, pom){
        const them = other_player(pom);
        const lc = new LetterCounts();
        // console.log("counts", lc.counts);
        let usmax = -20000000000;
        let maxpos;
        let themmax;
        let negthem;
        for (let posi = 0; posi < 625 ; posi++){
                if (grid[posi] != ''){
                        continue;
                }
                const grid1 = grid.slice();
                grid1[posi] = pom;
                const lc1 = new LetterCounts();
                //console.log("lc1", lc1);
                const paths1 = get_paths(posi);
                for (let paths1i = 0; paths1i < paths1.length; paths1i++){
                        const [base1, stride1] = paths1[paths1i];
                        lc1.adj_counts(grid1, base1, stride1, pom);
                }
                const score1 = score_counts(lc1, pom);
                if (score1 > 1000000000) {
                        console.log('winner! chicken dinner!'); // should break here
                        maxpos = posi;
                        break;
                }

                themmax = -2000000000;
                for (let posii = 0; posii < 625; posii++){
                        if (grid1[posii] != ''){
                                continue;
                        }
                        const grid2 = grid1.slice();
                        grid2[posii] = them;
                        const lc2 = new LetterCounts(lc1.counts);
                        const paths2 = get_paths(posii);
                        for (let paths2i = 0; paths2i < paths2.length; paths2i++){
                                const [base2, stride2] = paths2[paths2i];
                                //console.log("lc2", lc2);
                                lc2.adj_counts(grid2, base2, stride2, them);
                        }
                        //console.log("counts", lc2.counts)
                        const score2 = (score_counts(lc2, them) + Math.random() * 200);
                        //console.log("posi", posi, "posii", posii, "score2", score2, "themmax", themmax);
                        if (score2 > themmax) {
                                themmax = score2;
                                //console.log("posi", posi, "best possii (so far)", posii);
                        }
                }
                negthem = -themmax;
                if (negthem > usmax){
                        usmax = negthem;
                        maxpos = posi;
                }
                //console.log("posi", posi, "themmax", themmax, "usmax", usmax);
        }
        console.log("usmax", usmax);
        return maxpos;
}

const canvas = document.getElementById('the_canvas');
const mode = document.getElementById("frm").elements["mode"].value;
let the_game = new GameState(mode);

const pb = 6; // boundary between planes
const sqb = 2; // boundary between squares
const sqs = 16; //square size

const sqbc = "black";
const sqc = "lightgray";
const pbc = "dodgerblue";
const wc = "lightsalmon";


function redraw_canvas(){
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = sqc;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	let ii, iii;
	let x, y;
	// boundaries between squares in a plane
	ctx.fillStyle = sqbc;
	for (ii = 0; ii < 6; ii++){
			for (iii = 0; iii < 6; iii++){
					x = pb + ii * (pb + sqs * 5 + sqb * 6) + iii * (sqb + sqs);
					ctx.fillRect(x, 0, sqb, canvas.height);
					y = pb + ii * (pb + sqs * 5 + sqb * 6) + iii * (sqb + sqs);
					ctx.fillRect(0, y, canvas.width, sqb);
			}
	}
	// boundaries between planes
	ctx.fillStyle = pbc;
	for (ii = 0; ii < 6; ii++){
		x = ii * (pb + sqs * 5 + sqb * 6);
		ctx.fillRect(x, 0, pb, canvas.height);
		y = ii * (pb + sqs * 5 + sqb * 6);
		ctx.fillRect(0, y, canvas.width, pb);
	}
	if (the_game.winner){
			ctx.fillStyle = wc;
			const [base, stride] = the_game.win_line;
			console.log("base", base, "stride", stride);
			for (let wpos = base; wpos < base + stride * 5; wpos += stride){
			     const coords = pos_coords(wpos);
				 y = coords[0] * (pb + sqs * 5 + sqb * 6) + coords[1] * (sqb + sqs) + pb + sqb; 
				 x = coords[2] * (pb + sqs * 5 + sqb * 6) + coords[3] * (sqb + sqs) + pb + sqb;
				 console.log("x", x, "y", y);
				 ctx.fillRect(x, y, sqs, sqs);
			}
	}
	// noughts and crosses
	ctx.fillStyle = sqbc;
	for (ii = 0; ii < 625; ii++){
		if (the_game.grid[ii] != ''){ 
		    const coords = pos_coords(ii);
			text_pos = get_text_pos(coords);
			//console.log("coords", coords,"text_pos",  text_pos[0], text_pos[1]);
			ctx.fillText(the_game.grid[ii], text_pos[0], text_pos[1]);
		}
	}

}

/* find the 4 d coords of a click event if it corresponds to a square. returns the grid pos
 * or -1 */

function get_click_square(e) {
	const ps = pb + 5 * sqs + 6 * sqb; // plane size
	const rect = canvas.getBoundingClientRect();
	const canX = Math.floor(e.clientX - rect.left);
	const canY = Math.floor(e.clientY - rect.top);
	const planeX = Math.floor(canX / ps);
	const planeY = Math.floor(canY / ps);
	const relX = canX - (planeX * ps + pb);
	const relY = canY - (planeY * ps + pb);
	// console.log("relX", relX, "relY", relY);
	if (relX < 0) {
			return -1;
	}
	if (relY < 0) {
			return -1;
	}
    const sqX = Math.floor(relX / (sqb + sqs));
	const sqY = Math.floor(relY / (sqb + sqs));
	const pos =  grid_pos( planeY, sqY, planeX, sqX);
	// console.log("coords", planeX, sqX, planeY, sqY, pos);
	return pos;
}

function handle_canvas_click(e) {
	if (the_game.done) {
			return;
	}
	if (the_game.computer_moving){
			return;
	}
	pos = get_click_square(e);
	//console.log("clicked", pos);
	if (the_game.grid[pos] == ""){
		the_game.append_move(pos);
		redraw_canvas();
		if (the_game.done) return;
		if (the_game.mode == 'pvc'){
				the_game.computer_moving = true;
				//const computer_move = get_random_move(the_game.grid, the_game.pom);
				const computer_move = get_2ply_move(the_game.grid, the_game.pom);
				the_game.append_move(computer_move);
				the_game.computer_moving = false;
				redraw_canvas();
		}
	}
}

function handle_undo(){
		console.log("mode", mode);
		if (the_game.mode === "pvp"){
				the_game.undo_move();
		} else {
				the_game.undo_move();
				the_game.undo_move();
		}
		redraw_canvas();
}

function handle_new_game(){
		const mode = document.getElementById("frm").elements["mode"].value;
		console.log("new game");
		the_game = new GameState(mode);
		redraw_canvas();
}

// total canvas size should be pb * 6 + sqs * 25 + sqb * 30
canvas.width = pb * 6 + sqs * 25 + sqb * 30;
canvas.height = pb * 6 + sqs * 25 + sqb * 30;
canvas.onclick = handle_canvas_click;
document.getElementById('btn_new_game').onclick = handle_new_game;
document.getElementById('btn_undo').onclick = handle_undo;
redraw_canvas();


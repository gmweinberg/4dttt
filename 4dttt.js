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


const dims = [0, 1, 2, 3];
const strides = [125, 25, 5, 1];
const posits = [0, 1, 2, 3, 4]; // possible positions along a dimension
const grid = new Array(625);
const moves = new Array();

const pb = 6; // boundary between planes
const sqb = 2; // boundary between squares
const sqs = 16; //square size


const canvas = document.getElementById("the_canvas");
const sqbc = "black";
const sqc = "lightgray";
const pbc = "dodgerblue";
const wc = "lightsalmon";

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

// check if there is a win along the path with base, stride. If so returns letter of win (x or o)
function check_win_line(base, stride){
	letter = "?";
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

/*To win a game we get five in a row with 1, 2, 3 or 4 dimensions changing, and the others (if any) statying constant.
 * A win is characerized by a base (lowest grid position) and a stride.
 * A change along a dimension changes 1, 5, 25, or 125. If more than one dimension changes,
 * all except the most significant change + or -.
 * A diagonal win will have a stride that is a combo of + or - a combo of those numbers,
 * depending on how diagonal.
 * */

function get_basebases(changed_dims){
	if (changed_dims.length === 4){
		return [0];
	}
	let constdims = dims.filter(function (e) {return !changed_dims.includes(e)});
	let basebases = []
	let allconstpos = cartesian(...(Array(constdims.length).fill(posits)));
	for (let constposi in allconstpos){
		let constpos = allconstpos[constposi];
		const conststrides = elements_at(strides, constdims);
		const basebase = zip(constpos, conststrides);
		basebases.push(basebase);
	}
	return basebases;
}

function get_basestrides(basebase, changed_dims){
	let constdims = dims.filter(function (e) {return !changed_dims.includes(e)});
	if (constdims.length == 3){
		return [[basebase, strides[changed_dims[0]]]];
	}
}

function check_win(){
	let ii, diags, letter, stride;
	for (let changec = 1; changec < 5; changec++){ //changing dimension count
		let allchangeds = k_combinations(dims, changec);
		//console.log("allchangeds", allchangeds);
		for (let changed_dimi in allchangeds){ // for..in iterates over indices, not elements
			let changed_dims = allchangeds[changed_dimi];
			let basebases = get_basebases(changed_dims);
			//console.log("basebases", basebases);
			for (let basebasei in basebases){
				let basebase = basebases[basebasei];
				let basestrides = get_basestrides(basebase, changed_dims);
				for (let basestrides_i in  basestrides) {
					let [base, stride] = basestrides[basestrides_i];
				    //console.log("base", base, "stride", stride);
					let letter = check_win_line(base, stride);
					if (letter){
						console.log("win:", letter, base, stride);
						return [letter, base, stride];
					}
				}
		    }
		}
	}
}

function new_game(){
	let ii;
	for (ii = 0; ii < 625; ii++){
		grid[ii] = "";
	}
	moves.length = 0;
}

function get_text_pos(coords){
	let [y1, y2, x1, x2] = coords;
	const ps = pb + 5 * sqs + 6 * sqb; // plane size
	const xoff = 14;
	const yoff = 20;
	const x = x1 * ps + (sqs + sqb) * x2 + xoff;
	const y = y1 * ps + (sqs + sqb) * y2 + yoff;
	return [x, y];
}


function redraw_canvas(){
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = sqc;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	let ii, iii;
	let x, y;
	// boundaries between planes
	ctx.fillStyle = sqbc;
	for (ii = 0; ii < 6; ii++){
			for (iii = 0; iii < 6; iii++){
					x = pb + ii * (pb + sqs * 5 + sqb * 6) + iii * (sqb + sqs);
					ctx.fillRect(x, 0, sqb, canvas.height);
					y = pb + ii * (pb + sqs * 5 + sqb * 6) + iii * (sqb + sqs);
					ctx.fillRect(0, y, canvas.width, sqb);
			}
	}
	// boundaries between squares in a plane
	ctx.fillStyle = pbc;
	for (ii = 0; ii < 6; ii++){
		x = ii * (pb + sqs * 5 + sqb * 6);
		ctx.fillRect(x, 0, pb, canvas.height);
		y = ii * (pb + sqs * 5 + sqb * 6);
		ctx.fillRect(0, y, canvas.width, pb);
	}
	const win = check_win();
	// noughts and crosses
	ctx.fillStyle = sqbc;
	for (ii = 0; ii < 625; ii++){
		if (grid[ii] != ''){ 
		    coords = pos_coords(ii);
			text_pos = get_text_pos(coords);
			//console.log("coords", coords,"text_pos",  text_pos[0], text_pos[1]);
			ctx.fillText(grid[ii], text_pos[0], text_pos[1]);
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
	pos = get_click_square(e);
	if (grid[pos] == ""){
        grid[pos] = 'x';
		redraw_canvas();
	}
};

new_game();
// total canvas size should be pb * 6 + sqs * 25 + sqb * 30
canvas.width = pb * 6 + sqs * 25 + sqb * 30;
canvas.height = pb * 6 + sqs * 25 + sqb * 30;
canvas.onclick=handle_canvas_click;
redraw_canvas();


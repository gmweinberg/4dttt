/* The grid is a 5 x 5 x 5 x 5 array (625 total) squares, with values "x", "o" or "".
 * We view them as a 5 x 5 array of 5 x 5 planes.
 * Wr call the dimensions x1, x2, y1, y2 with the 2s being the diemsion inside the plane and
 * the 1s the dimeension of the plane.
 */

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

function grid_pos(x1, x2, y1, y2){
	return y1 * 125 + y2 * 25 + x1 * 5 + x2;
}

function pos_coords(pos){
    let x1, x2, y1, y2;
	y1 = Math.floor(pos/125);
	pos -= y1 * 125;
	y2 = Math.floor(pos / 25);
	pos -= y2 * 25;
	x1 = Math.floor(pos / 5);
	pos -= x1 * 5;
	x2 = pos;
	return [x1, x2, y1, y2];
}

function check_win(){
	let ii = 0;
}

function new_game(){
	let ii;
	for (ii = 0; ii < 625; ii++){
		grid[ii] = "";
	}
	moves.length = 0;
}

function get_text_pos(coords){
	let [x1, x2, y1, y2] = coords;
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
	ctx.fillStyle = sqbc;
	for (ii = 0; ii < 6; ii++){
			for (iii = 0; iii < 6; iii++){
					x = pb + ii * (pb + sqs * 5 + sqb * 6) + iii * (sqb + sqs);
					ctx.fillRect(x, 0, sqb, canvas.height);
					y = pb + ii * (pb + sqs * 5 + sqb * 6) + iii * (sqb + sqs);
					ctx.fillRect(0, y, canvas.width, sqb);
			}
	}
	for (ii = 0; ii < 6; ii++){
		ctx.fillStyle = pbc;
		x = ii * (pb + sqs * 5 + sqb * 6);
		ctx.fillRect(x, 0, pb, canvas.height);
		y = ii * (pb + sqs * 5 + sqb * 6);
		ctx.fillRect(0, y, canvas.width, pb);
	}
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
	const pos =  grid_pos(planeX, sqX, planeY, sqY);
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


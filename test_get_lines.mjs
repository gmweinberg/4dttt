//
//test a get_lines function. It shoudl return a list of lines that pass through a point


import { k_combinations, strides, dims, posits, cartesian, pos_coords, elements_at,
         other_player, LetterCounts, score_counts} from "./util.mjs"
// complimetary coords for diagonal. direction is ositiive or negative.
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

// find all paths given a point
function get_paths(pos){
	let result = [];
	let coords = pos_coords(pos);
	// do the straight line paths separately. All points are in 4 paths.
	for (let coordii = 0; coordii < 4; coordii++){
			let stride = strides[coordii];
			result.push([pos - coords[coordii] * stride, stride]);
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


//let paths = get_paths(312);
// console.log(paths);
//

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
const start = Date.now();
const grid = Array(625).fill('');
grid[0] = 'x';
grid[1] = 'x';
grid[2] = 'x';
//grid[3] = 'x';
grid[9] = 'x';
grid[14] = 'x';
grid[19] = 'x';
let pom = 'o';
//let maxpos = get_2ply_move(grid, pom);
//console.log("elapsed", (Date.now() - start) / 1000, "maxpos", maxpos);
let pos = 6;
console.log("pos", pos, "paths", get_paths(pos));

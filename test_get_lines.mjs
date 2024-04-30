//
//test a get_lines function. It shoudl return a list of lines that pass through a point


import { k_combinations, strides, dims, posits, cartesian, pos_coords, elements_at} from "./util.mjs"
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
	// do the stright line paths separately. All points are in 4.
	for (let stridei = 0; stridei < strides.length; stridei++){
			let stride = strides[stridei];
			let steps = Math.floor(pos / stride);
			result.push([pos - steps * stride, stride]);
	}
	// For a point to be along a diagonal along 2 dimensions, it must
	// have the same coords in both dimensions, or have the coord in 1 dimension be 4 - the
	// coord in the other. If both are true it is on both diags. Similarly for 3 and 4.
	let coords = pos_coords(pos);
	// we'll do this the sloppy way first, clean it up later
	for (let dim0 = 0; dim0 < 3; dim0++){
		for (let dim1 = dim0 + 1; dim1 < 4; dim1++){
		    if (coords[dim0] == coords[dim1]){
				let stride = strides[dim0] + strides[dim1];
				let steps = Math.floor(pos / stride);
				result.push([pos - steps * stride, stride]);
			}
		    if (coords[dim0] == 4 - coords[dim1]){
				let stride = strides[dim0] - strides[dim1];
				let steps = Math.floor(pos / stride);
				result.push([pos - steps * stride, stride]);
			}

		}
	}

	return result;

}

function get_diag_paths(pos){
	let result = [];
	let coords = pos_coords(pos);
	console.log("coords", coords);
	for (let var_dimc = 2; var_dimc < 5; var_dimc++){
		let all_var_dims = k_combinations(dims, var_dimc);
        for (let var_dimi = 0; var_dimi < all_var_dims.length; var_dimi++){
			let var_dims = all_var_dims[var_dimi];
			let other_dims = var_dims.slice(1);
			let base_stride = strides[var_dims[0]];
			console.log('base_stride', base_stride);
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
				console.log("ms", coords[var_dims[0]], "others", other_dims, "dirs",  all_dirs[dirsi], "comps", comps);
					let stride = base_stride;
					for (let other_dimsi = 0; other_dimsi < other_dims.length; other_dimsi++){
						stride += strides[other_dims[other_dimsi]] * all_dirs[dirsi][other_dimsi];
						console.log(strides[other_dims[other_dimsi]], all_dirs[dirsi][other_dimsi]);
					}
					let base = pos - stride * coords[[var_dims[0]]];
					result.push([base, stride])
				}
			}
		}
	}
	return result;
}

//let paths = get_paths(1);
// console.log(paths);
let diag_paths = get_diag_paths(1);
console.log(diag_paths);


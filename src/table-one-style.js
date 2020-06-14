/*
 * Table One Styling
 *
 * Default:
 * ++=======+========+=======++
 * ||   x   |    y   |   z   ||
 * ++=======+========+=======++
 * ||  1.3  |    0   |  -4   ||
 * ++-------+--------+-------++
 * ||       |        |       ||
 * ++=======+========+=======++
 *
 * Corner counting
 *  (1)    (2)
 *  (3)    (4)
 *
 * Outer border counting
 *      (3)
 *  (1)     (2)
 *      (4)
 *
 * Outer border cross counting
 *  (1) +    (2) |-    (3) -|    (4) T    (5) .|.
 *
 * Inner border counting
 *  (1) |   (2) --
 *
 * Inner cross counting
 *  (1) +    (2) |-    (3) -|    (4) T    (5) .|.
 *
 * Borders
 * - corner: array [ 1-2-3-4 ], [ 1-2, 3-4 ], [ 1, 2, 3, 4 ]
 * - outer: array [ 1-2-3-4 ], [ 1-2, 3-4 ], [ 1, 2, 3, 4 ]
 * - outerCross: array [ 1-2-3-4-5 ], [ 1, 2, 3, 4, 5 ]
 * - inner: array [ 1-2 ], [ 1, 2 ]
 * - innerCross: array [ 1-2-3-4-5 ], [ 1, 2, 3, 4, 5 ]
 *
 * Borders are defined individually for
 * - header
 * - index
 * - body
 * Header takes precendence over index and body where the overlap
 * Index takes precedence over body where they overlap
 *
 * Text style
 * - bold: boolean (default: false)
 * - align: left/center/right + top/middle/bottom (default: center middle)
 * - casing: none / small / capital / title (default: none)
 * - wrap: array of characters to wrap on or null (no wrap) (default: space)
 * - fill: fill cell with this character or sequence (default: space)
 * Text styles can be defined for the whole table, for body, header or index only or
 * for specific rows or columns; they will be applied in the order of definition and
 * specificty (table will be applied first, then specific styles)
 *
 * Size
 * - width: fixed width (number) or variable (two-value array)
 * - height: fixed (number) of variable (two-value array)
 * Width and height are defined for the entire table as arrays and/or as a general value
 * for all rows or columns
 * Specific values take precedence over general values
 *
 * Colors
 * - colors can be defined individually for each element as specified above, for
 *   individual sections, for borders, for text or for the entire table
 */

const colors = require("colors");

const object = require("util-one").object;

const TableOneRenderer = require("./table-one-renderer.js");

const stylePresets = require("./table-one-presets.js").styles;

class TableOneStyle {

	constructor () {
		this.setDefault();
	}

	setDefault() {
		this.style = JSON.parse(JSON.stringify(stylePresets[stylePresets.default]));
	}

	// TODO: setters for all style properties
	setHeaderBorderCorner (p) {
		this.style.borders.header.corner = p;
	}

	computeMissingBorders (borders) {
		let properties = [ "corner", "outer", "outerCross", "inner", "innerCross" ];
		for (let i=0; i<properties.length; i++) {
//			borders[properties[i]] = [ " " ];
			if (borders[properties[i]] === undefined)
				borders[properties[i]] = [ "" + i ];
		}
		return borders;
	}

	computeMissingText (text) {
		let properties = {
			bold: false,
			align: "center middle",
			casing: "none",
			wrap: [ " " ],
			fill: " "
		};
		for (let i in properties) {
			if (text[i] === undefined)
				text[i] = properties[i];
		}
		return text;
	}

	computeMissingColors (colors) {
		if (colors.border === undefined)
			colors.border = {};
		if (colors.border.color === undefined)
			colors.border.color = null;
		if (colors.border.bold === undefined)
			colors.border.bold = false;
		if (colors.text === undefined)
			colors.text = {};
		if (colors.text.color === undefined)
			colors.text.color = null;
		if (colors.text.bold === undefined)
			colors.text.bold = false;
	}

	copyIfUndefined (source, target, properties) {
		for (let i in properties) {
			if (target[i] === undefined)
				target[i] = source[properties[i]];
		}
		return target;
	}

	copyMissingBorders (source, target) {
		return this.copyIfUndefined(source, target, {
			"corner": "corner",
			"outer": "inner",
			"outerCross": "innerCross",
			"inner": "inner",
			"innerCross": "innerCross"
		});
	}

	copyMissingText (source, target) {
		return this.copyIfUndefined(source, target, {
			"bold": "bold",
			"align": "align",
			"casing": "casing",
			"wrap": "wrap",
			"fill": "fill"
		});
	}

	copyMissingColors (source, target) {
		let properties = {
			"color": "color",
			"bold": "bold"
		};
		object.createEmptyPath(target, [ "border" ]);
		object.createEmptyPath(target, [ "text" ]);
		this.copyIfUndefined(source.border, target.border, properties);
		this.copyIfUndefined(source.text, target.text, properties);
		return target;
	}

	expandCorners (arr) {
		switch (arr.length) {
			case 1:
				return {
					topLeft: arr[0],
					topRight: arr[0],
					bottomLeft: arr[0],
					bottomRight: arr[0]
				}
			case 2:
			case 3:
				return {
					topLeft: arr[0],
					topRight: arr[0],
					bottomLeft: arr[1],
					bottomRight: arr[1]
				}
			default:
				return {
					topLeft: arr[0],
					topRight: arr[1],
					bottomLeft: arr[2],
					bottomRight: arr[3]
				}
		}
		return null;
	}

	expandCross (arr) {
		switch (arr.length) {
			case 1:
				return {
					left: arr[0],
					right: arr[0],
					top: arr[0],
					bottom: arr[0]
				}
			case 2:
			case 3:
				return {
					left: arr[0],
					right: arr[0],
					top: arr[1],
					bottom: arr[1]
				}
			default:
				return {
					left: arr[0],
					right: arr[1],
					top: arr[2],
					bottom: arr[3]
				}
		}
		return null;
	}

	expandTJoin (arr) {
		switch (arr.length) {
			case 1:
			case 2:
			case 3:
			case 4:
				return {
					cross: arr[0],
					left: arr[0],
					right: arr[0],
					top: arr[0],
					bottom: arr[0]
				}
			default:
				return {
					cross: arr[0],
					left: arr[1],
					right: arr[2],
					top: arr[3],
					bottom: arr[4]
				}
		}
		return null;
	}

	expandLine (arr) {
		switch (arr.length) {
			case 1:
				return {
					ver: arr[0],
					hor: arr[0]
				}
			default:
				return {
					ver: arr[0],
					hor: arr[1]
				}
		}
		return null;
	}

	expandBorderArrays (target) {
		target.corner = this.expandCorners(target.corner);
		target.outer = this.expandCross(target.outer);
		target.outerCross = this.expandTJoin(target.outerCross);
		target.inner = this.expandLine(target.inner);
		target.innerCross = this.expandTJoin(target.innerCross);
	}

	expandPaddingArrays (target) {
		for (let i in target)
			target[i] = this.expandCross(target[i]);
	}

	// return a computed style object with no missing properties
	compute () {
		let ret = JSON.parse(JSON.stringify(this.style));
		
		// make sure borders object is present
		object.createEmptyPath(ret, [ "borders", "table" ]);
		// check table borders are complete and fill missing values
		this.computeMissingBorders(ret.borders.table);
		// inherit table borders if no specific body, header or index borders specified
		// but copy internal borders so that header, index or table sections don't stand out
		object.createEmptyPath(ret, [ "borders", "header" ]);
		object.createEmptyPath(ret, [ "borders", "index" ]);
		object.createEmptyPath(ret, [ "borders", "body" ]);
		this.copyMissingBorders(ret.borders.table, ret.borders.header);
		this.copyMissingBorders(ret.borders.table, ret.borders.index);
		this.copyMissingBorders(ret.borders.table, ret.borders.body);
		// expand border arrays to actual literal names
		for (let i in ret.borders)
			this.expandBorderArrays(ret.borders[i]);

		// make sure text object is present
		object.createEmptyPath(ret, [ "text", "table" ]);
		// check table text properties are complete and fill missing values
		this.computeMissingText(ret.text.table);
		// inherit header and index text from table text if not specified
		object.createEmptyPath(ret, [ "text", "header" ]);
		object.createEmptyPath(ret, [ "text", "index" ]);
		this.copyMissingText(ret.text.table, ret.text.header);
		this.copyMissingText(ret.text.table, ret.text.index);

		// make sure the size object is present
		// TODO:
		object.createEmptyPath(ret, [ "size" ]);

		// TODO: handle padding as well
		ret.padding = {
			cell: [ 1, 1, 0, 0 ]
		}
		this.expandPaddingArrays(ret.padding);

		// make sure the color object is present
		object.createEmptyPath(ret, [ "colors", "table" ]);
		// check table color properties are complete and fill in missing values
		this.computeMissingColors(ret.colors.table);
		// inherit header and index colors from table
		this.copyMissingColors(ret.colors.table, ret.colors.header);
		this.copyMissingColors(ret.colors.table, ret.colors.index);

		return ret;
	}

	getRenderer() {
		let renderer = new TableOneRenderer();
		renderer.setComputedStyle(this.compute());
		return renderer;
	}

}

module.exports = TableOneStyle;

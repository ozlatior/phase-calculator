/*
 * Table One Table Renderer Class
 * This class brings together styles and content and provides rendering
 * methods for table elements
 */

const string = require("util-one").string;

class TableOneRenderer {

	constructor () {
		this.computedStyle = null;
	}

	setComputedStyle (style) {
		this.computedStyle = style;
	}

	getColWidth (colData) {
		let ret = 0;
		for (let i=0; i<colData.length; i++) {
			let length = ("" + colData[i]).length;
			if (ret < length)
				ret = length;
		}
		return ret;
	}

	/*
	 * Add paddings and transform widths into x coordinates
	 */
	computeXCoordinates (widths, metrics) {
		let ret = widths.slice(0);
		for (let i=0; i<ret.length; i++) {
			ret[i] += metrics.l + metrics.r + metrics.c;
			if (i > 0)
				ret[i] += ret[i-1];
		}
		return ret;
	}

	/*
	 * Obtain an array of segments with length and ending for building borders based
	 * on cell widths and neighboring cell widths; segments are in the form
	 * { width, ending }, where ending can be either
	 * - c: for a border that crosses into the neighboring row
	 * - i: for a border that delimits an inner cell
	 * - o: for a border that delimits an outer cell
	 * - empty string: for the final border
	 * The metrics object contains paddings (l and r) and crossing widths (c)
	 * current:        |              |         |                |
	 *            --o--i----------o---i---------c-------o--------c--------
	 * neighbor:    |lllCONTENTrrr|             |       |        |
	 */
	computeHorizontalSegments (metrics, widths, outerWidths) {
		outerWidths = outerWidths.slice(0);
		// compute inner and outer crossing coordinates
		let iCoords = this.computeXCoordinates(widths, metrics);
		let oCoords = this.computeXCoordinates(outerWidths, metrics);
		// put all inner crossings in an object
		let crossings = {};
		for (let i=0; i<iCoords.length; i++)
			crossings[iCoords[i]] = "i";
		// now put all outer crossings and mark overlaps if needed
		for (let i=0; i<oCoords.length; i++)
			crossings[oCoords[i]] = crossings[oCoords[i]] === "i" ? "c" : "o";
		let ret = [];
		let last = 0;
		for (let i in crossings) {
			let coord = parseInt(i);
			ret.push({
				width: coord - last - metrics.c,
				ending: crossings[i]
			});
			last = coord;
		}
		return ret;
	}

	/*
	 * Render an horizontal table border
	 * widths: array of widths for total length and drawing the corner
	 * padding: object with paddings (left and right)
	 * pattern: string with the pattern to draw in
	 * cornerLeft: left corner for table border
	 * cornerRight: right corner for table border
	 * cross: pattern for cell crosses
	 * neighbor: object describing the neighboring row, if any:
	 * - position: top or bottom
	 * - widths: widths of neighbor cells for drawing crosses
	 * - tJoinIn: inwards t join for neighboring cells
	 * - tJoinOut: outwards t join for neighboring cells
	 *      |              |         |                |
	 * --+--+----------+---+---------+-------+--------+--------
	 *   |             |             |       |        |
	 *
	 */
	renderHorizontalBorder (widths, padding, pattern, cornerLeft, cornerRight, cross, neighbor) {
		let ret = [];
		if (!neighbor)
			neighbor = { position: "top", widths: widths, tJoinIn: cross, tJoinOut: cross };
		// TODO: handle cases where crosses are different width (maybe in style class?)
		// TODO: handle crosses overlap
		let seg = this.computeHorizontalSegments(
			{ l: padding.left, r: padding.right, c: cross.length }, widths, neighbor.widths);
		let endings = { c: cross, i: neighbor.tJoinIn, o: neighbor.tJoinOut };
		for (let i=0; i<seg.length; i++) {
			let segment = string.fill(seg[i].width, pattern);
			if (i > 0)
				segment = endings[seg[i-1].ending] + segment;
			ret.push(segment);
		}
		ret = ret.join("");
		ret = cornerLeft + ret + cornerRight;
		return ret;
	}

	/*
	 * Format cell content text according to style and width
	 */
	formatCellContent (content, width, textStyle) {
		switch (textStyle.casing) {
			case "title":
				content = string.changeCase.titleCase(content);
				break;
			case "small":
				content = content.toLowerCase();
				break;
			case "capital":
				content = content.toUpperCase();
				break;
		}
		if (textStyle.align.indexOf("left") !== -1)
			content = string.boxLeft(content, width, textStyle.fill);
		if (textStyle.align.indexOf("right") !== -1)
			content = string.boxRight(content, width, textStyle.fill);
		if (textStyle.align.indexOf("center") !== -1)
			content = string.boxCenter(content, width, textStyle.fill);
		return content;
	}

	/*
	 * Render a single horizontal row with content, based on widths, padding (left, right)
	 * and inner and outer borders
	 */
	renderHorizontalRow (widths, content, padding, textStyle, inner, outer) {
		content = content.slice(0);
		for (let i=0; i<content.length; i++) {
			content[i] = this.formatCellContent(content[i], widths[i], textStyle);
			content[i] = string.fill(padding.left, " ") + content[i];
			content[i] += string.fill(padding.right, " ");
		}
		content = content.join(inner);
		content = outer.left + content + outer.right;
		return content;
	}

	renderTableBorderTop (widths) {
		let s = this.computedStyle;
		return this.renderHorizontalBorder(widths, s.padding.cell, s.borders.table.outer.top,
			s.borders.table.corner.topLeft, s.borders.table.corner.topRight, s.borders.table.outerCross.top);
	}

	renderTableBorderBottom (widths) {
		let s = this.computedStyle;
		return this.renderHorizontalBorder(widths, s.padding.cell, s.borders.table.outer.bottom,
			s.borders.table.corner.bottomLeft, s.borders.table.corner.bottomRight, s.borders.table.outerCross.bottom);
	}

	renderTableRowBorder (widths) {
		let s = this.computedStyle;
		return this.renderHorizontalBorder(widths, s.padding.cell, s.borders.body.inner.hor,
			s.borders.body.corner.bottomLeft, s.borders.body.corner.bottomRight, s.borders.body.innerCross.bottom);
	}

	renderTableRowContents(widths, content) {
		let s = this.computedStyle;
		return this.renderHorizontalRow(widths, content, s.padding.cell, s.text.table,
			s.borders.body.inner.ver, s.borders.body.outer);
	}

	renderOutputRows(table) {
		let ret = [];
		let rows = table.getRowCount();
		let cols = table.getColCount();
		let widths = [];
		for (let i=0; i<cols; i++)
			widths.push(this.getColWidth(table.getColAt(i)));

		ret.push(this.renderTableBorderTop(widths));

		for (let i=0; i<rows; i++) {
			let row = table.getRowAt(i);
			if (table.isHeaderRow(i)) {
			}
			else {
				ret.push(this.renderTableRowContents(widths, row));
				if (i < rows-1)
					ret.push(this.renderTableRowBorder(widths));
			}
		}

		ret.push(this.renderTableBorderBottom(widths));

		return ret;
	}

}

module.exports = TableOneRenderer;

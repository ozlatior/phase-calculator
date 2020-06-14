/*
 * Table Output Class
 */

const colors = require("colors");
const string = require("util-one").string;

const TableOneStyle = require("./table-one-style.js");

class TableOne {

	constructor (name, data, header, index) {
		if (!name)
			this.name = null;
		else
			this.setName(name);
		
		if (!data)
			this.data = null;
		else
			this.setCells(data);

		if (!header)
			this.headerRows = [];
		else
			this.insertHeaderRowAt(0, header);

		if (!index)
			this.indexCols = [];
		else
			this.insertIndexColAt(0, index);

		this.style = new TableOneStyle();
	}

	setName (name) {
		this.name = name;
	}

	setHeaderRow (row) {
		if (this.headerRows.indexOf(row) === -1) {
			this.headerRows.push(row);
			return true;
		}
		return false;
	}

	clearHeaderRow (row) {
		let index = this.headerRows.indexOf(row);
		if (index === -1)
			return false;
		this.headerRows.splice(index, 1);
		return true;
	}

	setIndexCol (col) {
		if (this.indexCols.indexOf(col) === -1) {
			this.indexCols.push(col);
			return true;
		}
		return false;
	}

	clearIndexCol (col) {
		let index = this.indexCols.indexOf(col);
		if (index === -1)
			return false;
		this.indexCols.splice(index, 1);
		return true;
	}

	hasHeaderRows () {
		return this.headerRows.length > 0;
	}

	hasIndexCols () {
		return this.indexCols.length > 0;
	}

	isHeaderRow (row) {
		return this.headerRows.indexOf(row) !== -1;
	}

	isIndexCol (col) {
		return this.indexCols.indexOf(col) !== -1;
	}

	// TODO: implement skip index cols
	insertDataRow (row, skipIndexCols) {
		row = row.slice(0);
		if (this.data === null)
			this.data = [];
		this.data.push(row);
	}

	insertDataCol (col, skipHeaderRows) {
		col = col.slice(0);
		let colCount = this.getColCount();
		if (this.data === null)
			this.data = [];
		for (let i=0; i<col.length; i++) {
			if (this.data[i] === undefined)
				this.data[i] = [];
			this.data[i][colCount] = col[i];
		}
	}

	setCellAt (row, col, value) {
		if (this.data === null)
			this.data = [];
		if (this.data[row] === undefined)
			this.data[row] = [];
		this.data[row][col] = value;
	}

	getCellAt (row, col) {
		if (this.data === null)
			return null;
		if (row >= this.data.length)
			return null;
		if (col >= this.data[row].length)
			return null;
		return this.data[row][col];
	}

	getRowAt (row) {
		if (this.data === null)
			return null;
		if (row >= this.data.length)
			return null;
		return this.data[row].slice(0);
	}

	getColAt (col) {
		if (this.data === null)
			return null;
		let ret = [];
		for (let i=0; i<this.data.length; i++) {
			ret.push(this.data[i][col]);
		}
		return ret;
	}

	setCells (data) {
		this.data = JSON.parse(JSON.stringify(data));
	}

	getRowCount () {
		if (this.data === null)
			return 0;
		return this.data.length;
	}

	getColCount () {
		if (this.data === null)
			return 0;
		let count = 0;
		for (let i=0; i<this.data.length; i++)
			if (this.data[i] && this.data[i].length > count)
				count = this.data[i].length;
		return count;
	}

	normalize () {
		if (this.data === null)
			return;
		let rows = this.getRowCount();
		let cols = this.getColCount();
		for (let i=0; i<rows; i++) {
			if (this.data[i] === undefined)
				this.data[i] = [];
			for (let j=0; j<cols; j++) {
				if (this.data[i][j] === undefined)
					this.data[i][j] = "";
			}
		}
	}

	toOutputRows (style) {
		if (!style)
			style = this.style;
		this.normalize();
		let renderer = this.style.getRenderer();
		return renderer.renderOutputRows(this);
	}

	toString (style) {
		if (!style)
			style = this.style;
		return this.toOutputRows(style).join("\n");
	}

}

module.exports = TableOne;

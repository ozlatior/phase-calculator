const TableOne = require("./src/table-one.js");

function randomStr (min, max) {
	let letters = "aaaabcdeeeefghiiijklmnooopqrstuuvwxyz-      ";
	let len = Math.floor(Math.random() * (max - min)) + min;
	let ret = "";
	for (let i=0; i<len; i++)
		ret += letters[Math.floor(Math.random() * letters.length)];
	return ret;
}

function gaps (rows, cols, min, max) {
	let table = new TableOne();
	for (let i=0; i<rows; i++)
		for (let j=0; j<cols; j++) {
			if ((i * rows + j) % 5 === 0 || (i * rows + j) % 4 === 0)
				continue;
			table.setCellAt(i, j, randomStr(min, max));
		}
	table.setHeaderRow(1);
	table.setIndexCol(1);
	console.log(table.toString());
}

gaps(7, 10, 5, 20);

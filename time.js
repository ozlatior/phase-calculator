const time = require("./src/time.js");
const TimeOne = require("./src/time-one.js");
const TableOne = require("./src/table-one.js");

const string = require("util-one").string;

function interval(i) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, i);
	});
}

async function utils() {
	let tokens = [
		"YYYY", "YY", "MM", "M", "MON", "Mon", "mon", "MONTH", "Month", "month",
		"DD", "D", "HH", "H", "hh", "h", "mm", "m", "ss", "s", "CC", "Cc", "cc", "mmm", "MMM", "AP", "ap",
		"WW", "W", "ww", "w", "DW", "dw", "DOW", "Dow", "dow", "DAY", "Day", "day"
	];
	let date = new Date("2020-01-05 01:02:03");
	date.setMilliseconds(3);
	console.log([
		string.boxLeft("", 3, "-"),
		string.boxLeft("", 10, "-"),
		string.boxLeft("", 10, "-"),
		string.boxLeft("", 10, "-")
	].join("---"));
	console.log([
		string.boxLeft("i", 3),
		string.boxLeft("Token", 10),
		string.boxCenter("Local", 10),
		string.boxCenter("UTC", 10)
	].join(" | "));
	console.log([
		string.boxLeft("", 3, "-"),
		string.boxLeft("", 10, "-"),
		string.boxLeft("", 10, "-"),
		string.boxLeft("", 10, "-")
	].join("-|-"));
	for (let i=0; i<tokens.length; i++) {
		console.log([
			string.padLeft(i, 3),
			string.padLeft(tokens[i], 10),
			string.padRight(time.formatToken(tokens[i], date), 10),
			string.padRight(time.formatToken(tokens[i], date, { utc: true }), 10)
		].join(" | "));
	}
	console.log([
		string.boxLeft("", 3, "-"),
		string.boxLeft("", 10, "-"),
		string.boxLeft("", 10, "-"),
		string.boxLeft("", 10, "-")
	].join("---"));

	let formatStr = [];
	for (let i=0; i<tokens.length; i++)
		formatStr.push("##"+i+"##: " + tokens[i]);
	formatStr = formatStr.join("\n");
	let res;
	res = time.formatDate(formatStr, date);
	for (let i=0; i<tokens.length; i++)
		res = res.replace("##"+i+"##", string.padLeft(tokens[i], 10));
	console.log("============");
	console.log(res);
	res = time.formatDate(formatStr, date, { utc: true });
	for (let i=0; i<tokens.length; i++)
		res = res.replace("##"+i+"##", string.padLeft(tokens[i], 10));
	console.log("============");
	console.log(res);

	console.log(time.formatDate("Day, DD-MM-YYYY hh:mm:ss.mmm AP", date));
}

async function timers() {
	let current = new TimeOne();
	let fixed = new TimeOne();
	let cursive = new TimeOne();
	fixed.setUtcStatic("2020-05-29 11:05:00");
	cursive.setUtcCursive("2020-05-29 11:05:00");

	console.log("After creation:");
	console.log("current: " + current.getUnixTime());
	console.log("    UTC  " + current.toTimeString(true));
	console.log("  local  " + current.toTimeString(false));
	console.log("  fixed: " + fixed.getUnixTime());
	console.log("    UTC  " + fixed.toTimeString(true));
	console.log("  local  " + fixed.toTimeString(false));
	console.log("cursive: " + cursive.getUnixTime());
	console.log("    UTC  " + cursive.toTimeString(true));
	console.log("  local  " + cursive.toTimeString(false));

	await interval(1000);

	console.log("One second later:");
	console.log("current: " + current.getUnixTime());
	console.log("    UTC  " + current.toTimeString(true));
	console.log("  local  " + current.toTimeString(false));
	console.log("  fixed: " + fixed.getUnixTime());
	console.log("    UTC  " + fixed.toTimeString(true));
	console.log("  local  " + fixed.toTimeString(false));
	console.log("cursive: " + cursive.getUnixTime());
	console.log("    UTC  " + cursive.toTimeString(true));
	console.log("  local  " + cursive.toTimeString(false));

	current.setForward(60 * 60 * 1000);
	fixed.setForward(60 * 60 * 1000);
	cursive.setForward(60 * 60 * 1000);

	console.log("One hour later:");
	console.log("current: " + current.getUnixTime());
	console.log("    UTC  " + current.toTimeString(true));
	console.log("  local  " + current.toTimeString(false));
	console.log("  fixed: " + fixed.getUnixTime());
	console.log("    UTC  " + fixed.toTimeString(true));
	console.log("  local  " + fixed.toTimeString(false));
	console.log("cursive: " + cursive.getUnixTime());
	console.log("    UTC  " + cursive.toTimeString(true));
	console.log("  local  " + cursive.toTimeString(false));
}

async function clocks() {
	let output = new TableOne();
	let count = 6;
	let extra = 3;
	let clocks = [];
	let col = [ "" ];
	
	// initialize clocks
	for (let i=0; i<count; i++) {
		col.push("Clock " + i);
		clocks[i] = new TimeOne();
	}
	output.insertDataCol(col);

	// every second stop one clock and output all dates
	for (let i=0; i<count; i++) {
		clocks[i].stop();
		col = [ "Step " + i ];
		for (let j=0; j<count; j++)
			col.push(clocks[j].toTimeString());
		output.insertDataCol(col);
		await interval(1000);
	}

	// forward all clocks by one day
	for (let i=0; i<count; i++)
		clocks[i].setForward(TimeOne.DAY);

	// start all clocks
	for (let i=0; i<count; i++)
		clocks[i].start();

	// every two seconds forward the clocks by one hour and output all dates
	for (let i=0; i<extra; i++) {
		await interval(2000);
		col = [ "Extra " + i ];
		for (let j=0; j<count; j++) {
			clocks[j].setForward(TimeOne.HOUR);
			col.push(clocks[j].toTimeString());
		}
		output.insertDataCol(col);
	}

	// print the table
	console.log(output.toString());
}

async function gettersAndSetters() {
	let values = {
		"Year": 2021,
		"Month": 3,
		"Date": 10,
		"Hours": 3,
		"Minutes": 42,
		"Seconds": 05,
		"Milliseconds": 333
	};
	let clock = new TimeOne();

	console.log("time: " + clock.toTimeString(true));
	console.log("unix: " + clock.getUnixTime());
	clock.setUnixTime(clock.getUnixTime());
	console.log("time: " + clock.toTimeString(true));
	console.log("tran: " + clock.toTimeString());
	console.log("unix: " + clock.getTranslatedLocalTime());
	clock.setTranslatedLocalTime(clock.getTranslatedLocalTime());
	console.log("tran: " + clock.toTimeString());

	clock = new TimeOne();

	let output = new TableOne();
	output.insertDataRow([ "Property", "Value (local)", "Value (UTC)" ]);
	output.insertDataRow([ "timezone", clock.getTimezoneGeneric(), "GMT+0000" ]);
	output.insertDataRow([ "time", clock.toTimeString(), clock.toTimeString(true) ]);
	for (let i in values) {
		output.insertDataRow([ i, clock["get" + i](), clock["get" + i](true) ]);
	}
	console.log("before timezone change:");
	console.log(output.toString());
	console.log();

	clock.setTimezone(4);
	output = new TableOne();
	output.insertDataRow([ "Property", "Value (local)", "Value (UTC)" ]);
	output.insertDataRow([ "timezone: ", clock.getTimezoneGeneric(), "GMT+0000" ]);
	output.insertDataRow([ "time", clock.toTimeString(), clock.toTimeString(true) ]);
	for (let i in values) {
		output.insertDataRow([ i, clock["get" + i](), clock["get" + i](true) ]);
	}
	console.log("after timezone change:");
	console.log(output.toString());
	console.log();

	for (let i in values)
		clock["set" + i](values[i]);
	output = new TableOne();
	output.insertDataRow([ "Property", "Value (set)", "Value (local)", "Value (UTC)" ]);
	output.insertDataRow([ "timezone: ", 4, clock.getTimezoneGeneric(), "GMT+0000" ]);
	output.insertDataRow([ "time", "<none>", clock.toTimeString(), clock.toTimeString(true) ]);
	for (let i in values) {
		output.insertDataRow([ i, values[i], clock["get" + i](), clock["get" + i](true) ]);
	}
	console.log("after setting local time:");
	console.log(output.toString());
	console.log();

	for (let i in values)
		clock["set" + i](values[i], true);
	output = new TableOne();
	output.insertDataRow([ "Property", "Value (set)", "Value (local)", "Value (UTC)" ]);
	output.insertDataRow([ "timezone: ", 4, clock.getTimezoneGeneric(), "GMT+0000" ]);
	output.insertDataRow([ "time", "<none>", clock.toTimeString(), clock.toTimeString(true) ]);
	for (let i in values) {
		output.insertDataRow([ i, values[i], clock["get" + i](), clock["get" + i](true) ]);
	}
	console.log("after setting UTC time:");
	console.log(output.toString());
	console.log();
}

function currentSetters () {
	let values = {
		"mmm": 100,
		"ss": 10,
		"mm": 20,
		"HH": "05",
		"DD": 15,
		"MM": "02",
		"YYYY": 2022,
		"HH:mm:ss": "15:12:27",
		"YYYY-MM-DD": "1999-03-22",
		"DD-MM": "12-08"
	};
	let output = new TableOne();
	output.insertDataRow([ "Property", "Value", "UTC", "sharp", "Before", "After" ]);
	for (let i in values) {
		for (let j=0; j<2; j++) {
			for (let k=0; k<2; k++) {
				let utc = !!j;
				let sharp = !!k;
				let clock = new TimeOne();
				clock.setUtcStatic("2020-12-31 22:14:55");
				let before = clock.toTimeString();
				clock.setCurrent(i, "" + values[i], { utc: utc, sharp: sharp });
				output.insertDataRow([ i, values[i], utc, sharp, before, clock.toTimeString() ]);
			}
		}
	}
	console.log(output.toString());
}

function forwardSetters () {
	let dates = [ "02-03-2010 14:55:44", "31-10-2015 02:12:18", "31-01-2016 23:40:50", "29-02-2020 00:00:00" ];
	let values = [
		[ TimeOne.SECOND, 30, "second" ],
		[ TimeOne.MINUTE, 20, "minute" ],
		[ TimeOne.HOUR, 6, "hour" ],
		[ TimeOne.DAY, 5, "day" ],
		[ "month", 1 ],
		[ "month", 4 ],
		[ "month", 40 ],
		[ "year", 1 ],
		[ "year", 8 ]
	];
	let clocks = dates.map((item) => {
		let ret = new TimeOne();
		ret.setTimezone(2);
		ret.setUtcStatic(item);
		return ret;
	});
	let output = new TableOne();
	output.insertDataRow([ "Unit", "Value", "Clock (UTC)", "Back (UTC)", "Back (local)", "Forward (UTC)", "Forward (local)" ]);
	for (let i=0; i<values.length; i++) {
		for (let j=0; j<clocks.length; j++) {
			let bc = new TimeOne(clocks[j]);
			let fc = new TimeOne(clocks[j]);
			switch (values[i][0]) {
				case "month":
					bc.setBackByMonths(values[i][1]);
					fc.setForwardByMonths(values[i][1]);
					break;
				case "year":
					bc.setBackByYears(values[i][1]);
					fc.setForwardByYears(values[i][1]);
					break;
				default:
					bc.setBack(values[i][1], values[i][0]);
					fc.setForward(values[i][1], values[i][0]);
			}
			output.insertDataRow([ values[i][2] ? values[i][2] : values[i][0], values[i][1], clocks[j].toTimeString(true),
				bc.toTimeString(true), bc.toTimeString(), fc.toTimeString(true), fc.toTimeString() ]);
		}
	}
	console.log(output.toString());
}

function previousSetters () {
	let dates = [ "02-03-2010 14:55:44", "31-10-2015 02:12:18", "31-01-2016 23:40:50", "29-02-2020 00:00:00" ];
	let values = [
		[ "HH", "00" ],
		[ "HH:mm", "20:15" ],
		[ "HH:mm:ss", "14:44:54" ],
		[ "D", "15" ],
		[ "M", "2" ],
		[ "M", "7" ]
	];
	let clocks = dates.map((item) => {
		let ret = new TimeOne();
		ret.setTimezone(2);
		ret.setUtcStatic(item);
		return ret;
	});
	let output = new TableOne();
	output.insertDataRow([ "Format", "Value", "Sharp", "Current",
		"Previous (UTC)", "Previous (local)", "Next (UTC)", "Next (local)" ]);
	for (let i=0; i<values.length; i++) {
		for (let j=0; j<clocks.length; j++) {
			for (let k=0; k<=1; k++) {
				let sharp = !!k;
				let prvUtc = new TimeOne(clocks[j]);
				let prvLoc = new TimeOne(clocks[j]);
				let nxtUtc = new TimeOne(clocks[j]);
				let nxtLoc = new TimeOne(clocks[j]);
				prvUtc.setPrevious(values[i][0], values[i][1], { utc:  true, sharp: sharp });
				prvLoc.setPrevious(values[i][0], values[i][1], { utc: false, sharp: sharp });
				nxtUtc.setNext(values[i][0], values[i][1], { utc:  true, sharp: sharp });
				nxtLoc.setNext(values[i][0], values[i][1], { utc: false, sharp: sharp });
				output.insertDataRow([
					values[i][0], values[i][1], sharp, clocks[j].toTimeString(true),
					prvUtc.toTimeString(true), prvLoc.toTimeString(),
					nxtUtc.toTimeString(true), nxtLoc.toTimeString()
				]);
			}
		}
	}
	console.log(output.toString());
}

//utils();

//timers();

//clocks();

//gettersAndSetters();

//currentSetters();

//forwardSetters();

previousSetters();

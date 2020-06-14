const string = require("util-one").string;

const time = {

	/*
	 * Return a generic timezone string such as GMT+0200 based on tz specified in hours
	 * Quarter hour resolution supported
	 */
	genericTimezoneString: function(tz) {
		let ret = "GMT";
		if (tz < 0) {
			ret += "-";
			tz = -tz;
		}
		else
			ret += "+";
		let h = Math.floor(tz);
		if (h < 10)
			ret += "0";
		ret += h;
		tz -= h;
		switch (tz) {
			case 0:
				return ret + "00";
			case 0.25:
				return ret + "15";
			case 0.5:
				return ret + "30";
			case 0.75:
				return ret + "45";
		}
		return ret + "--";
	},

	getUTCWeekNumber: function(date, weekStartsMonday) {
		// get date at start of year
		var soy = new Date(date);
		soy.setUTCMonth(0);
		soy.setUTCDate(1);
		soy.setUTCHours(0);
		soy.setUTCMinutes(0);
		// get days since start of year
		let offset = date.getTime() - soy.getTime();
		offset = offset / (60 * 60 * 1000);
		// get offset in days
		offset /= 24;
		// add day of week at start of year
		offset += soy.getUTCDay();
		let ret = Math.ceil(offset / 7);
		if (weekStartsMonday) {
			// if this is a Sunday, count it as part of previous week
			if (date.getUTCDay() === 0)
				ret--;
			// if year starts on a Sunday, everything is offset by one
			if (soy.getUTCDay() === 0)
				ret++;
		}
		return ret;
	},

	getLocalWeekNumber: function(date, weekStartsMonday) {
		// get date at start of year
		var soy = new Date(date);
		soy.setMonth(0);
		soy.setDate(1);
		soy.setHours(0);
		soy.setMinutes(0);
		// get days since start of year
		let offset = date.getTime() - soy.getTime();
		offset = offset / (60 * 60 * 1000);
		// get offset in days
		offset /= 24;
		// add day of week at start of year
		offset += soy.getDay();
		let ret = Math.ceil(offset / 7);
		if (weekStartsMonday) {
			// if this is a Sunday, count it as part of previous week
			if (date.getDay() === 0)
				ret--;
			// if year starts on a Sunday, everything is offset by one
			if (soy.getDay() === 0)
				ret++;
		}
		return ret;
	},

	getWeekNumber: function(date, utc, weekStartsMonday) {
		if (utc)
			return time.getUTCWeekNumber(date, weekStartsMonday);
		return time.getLocalWeekNumber(date, weekStartsMonday);
	},

	/*
	 * Get a regexp string for specific time token
	 * Tokens:
	 * - YYYY: four-digit year
	 * - YYY: four- or two-digit year
	 * - YY: two-digit year
	 * - MM: two digit month, leading zero
	 * - M: one or two digit month (no leading zero)
	 * - DD: two digit day of month, leading zero
	 * - D: one or two digit day of month (no leading zero)
	 * - HH: two digit 24-hour format hour, leading zero
	 * - H: one digit 24-hour format hour (no leading zero)
	 * - hh: two digit 12-hour format hour, leading zero
	 * - h: one digit 12-hour format hour (no leading zero)
	 * - mm: two digit minutes, leading zero
	 * - m: one digit minutes, no leading zero
	 * - ss: two digit seconds, leading zero
	 * - s: one digit seconds, no leading zero
	 * - CC: two digit hundreds of a second
	 * - Cc: two digit hundreds of a second
	 * - cc: two digit hundreds of a second
	 * - MMM: three digit milliseconds
	 * - mmm: three digit milliseconds
	 * - AP: AM/PM uppercase
	 * - Ap: AM/PM any case
	 * - ap: am/pm lowercase
	 */
	tokenRegexpString: function(token) {
		switch (token) {
			case "YYYY":
				return "[0-9]{4}";
			case "YYY":
				return "[0-9]{2}([0-9]{2})?";
			case "YY":
				return "[0-9]{2}";
			case "MM":
				return "(0[1-9])|(1[012])";
			case "M":
				return "(0?[1-9])|(1[012])";
			case "DD":
				return "(0[0-9])|([12][0-9])|(3[01])";
			case "D":
				return "(0?[0-9])|([12][0-9])|(3[01])";
			case "HH":
				return "([0-1][0-9])|(2[0-3])";
			case "H":
				return "([0-1]?[0-9])|(2[0-3])";
			case "hh":
				return "(0[0-9])|(1[0-2])";
			case "h":
				return "(0?[0-9])|(1[0-2])";
			case "mm":
			case "ss":
				return "[0-5][0-9]";
			case "m":
			case "s":
				return "[0-5]?[0-9]";
			case "CC":
			case "Cc":
			case "cc":
				return "[0-9]{2}";
			case "MMM":
			case "mmm":
				return "[0-9]{3}";
			case "AP":
				return "AM|PM";
			case "Ap":
				return "AM|PM|am|pm";
			case "ap":
				return "am|pm";
		}
		return token;
	},

	/*
	 * Set corresponding time token value in date object
	 * Tokens:
	 * - YYYY: four-digit year
	 * - YYY: four- or two-digit year
	 * - YY: two-digit year
	 * - MM: two digit month, leading zero
	 * - M: one or two digit month (no leading zero)
	 * - DD: two digit day of month, leading zero
	 * - D: one or two digit day of month (no leading zero)
	 * - HH: two digit 24-hour format hour, leading zero
	 * - H: one digit 24-hour format hour (no leading zero)
	 * - hh: two digit 12-hour format hour, leading zero
	 * - h: one digit 12-hour format hour (no leading zero)
	 * - mm: two digit minutes, leading zero
	 * - m: one digit minutes, no leading zero
	 * - ss: two digit seconds, leading zero
	 * - s: one digit seconds, no leading zero
	 * - CC: two digit hundreds of a second
	 * - Cc: two digit hundreds of a second
	 * - cc: two digit hundreds of a second
	 * - MMM: three digit milliseconds
	 * - mmm: three digit milliseconds
	 * - AP: AM/PM uppercase
	 * - Ap: AM/PM any case
	 * - ap: am/pm lowercase
	 */
	applyTokenValue: function(date, token, value, utc) {
		switch (token) {
			case "YYYY":
				if (utc)
					return date.setUTCFullYear(parseInt(value));
				return date.setFullYear(parseInt(value));
			case "YYY":
				value = parseInt(value);
				if (value < 50)
					value += 2000;
				else if (value < 100)
					value += 1900;
			case "YY":
				if (utc)
					return date.setUTCFullYear(parseInt(value));
				return date.setFullYear(parseInt(value));
			case "MM":
			case "M":
				if (utc)
					return date.setUTCMonth(parseInt(value) - 1);
				return date.setMonth(parseInt(value) - 1);
			case "DD":
			case "D":
				if (utc)
					return date.setUTCDate(parseInt(value));
				return date.setDate(parseInt(value));
			case "HH":
			case "H":
			case "hh":
			case "h":
				if (utc)
					return date.setUTCHours(parseInt(value));
				return date.setHours(parseInt(value));
			case "mm":
			case "m":
				if (utc)
					return date.setUTCMinutes(parseInt(value));
				return date.setMinutes(parseInt(value));
			case "ss":
			case "s":
				if (utc)
					return date.setUTCSeconds(parseInt(value));
				return date.setSeconds(parseInt(value));
			case "CC":
			case "Cc":
			case "cc":
				if (utc)
					return date.setUTCMilliseconds(parseInt(value) * 10);
				return date.setMilliseconds(parseInt(value) * 10);
			case "MMM":
			case "mmm":
				if (utc)
					return date.setUTCMilliseconds(parseInt(value));
				return date.setMilliseconds(parseInt(value));
			case "AP":
			case "Ap":
			case "ap":
				if (value.toLowerCase() === "pm")
					return date.setTime(date.getTime() + 12 * 60 * 60 * 1000);
				return date.getTime();
		}
		return null;
	},

	tokenMeaning(token) {
		switch (token) {
			case "YYYY":
			case "YY":
				return "year";
			case "MM":
			case "M":
				return "month";
			case "MON":
			case "Mon":
			case "mon":
				return "month/short";
			case "MONTH":
			case "Month":
			case "month":
				return "month/long";
			case "DD":
			case "D":
				return "date";
			case "HH":
			case "H":
			case "hh":
			case "h":
			case "AP":
			case "ap":
				return "hours";
			case "mm":
			case "m":
				return "minutes";
			case "ss":
			case "s":
				return "seconds";
			case "CC":
			case "Cc":
			case "cc":
				return "hundredths";
			case "MMM":
			case "mmm":
				return "milliseconds";
			case "WW":
			case "W":
			case "ww":
			case "w":
				return "week";
			case "DW":
			case "dw":
				return "day of week";
			case "DOW":
			case "Dow":
			case "dow":
				return "day of week/short";
			case "DAY":
			case "Day":
			case "day":
				return "day of week/long";
		}
		return token;
	},

	shortestToken(format) {
		let tokens = [
			"YYYY", "YY", "MM", "M", "DD", "D", "HH", "H", "hh", "h", "mm", "m", "ss", "s",
			"CC", "Cc", "cc", "mmm", "MMM", "AP", "Am", "ap"
		];
		let order = [ "milliseconds", "seconds", "minutes", "hours", "date", "month", "year" ];
		tokens.sort((a, b) => b.length - a.length);
		// first, extract all tokens
		let tokenRegexp = new RegExp("(?<![a-zA-Z])(" + tokens.join("|") + ")(?![a-zA-Z])", "g");
		let m = format.match(tokenRegexp);
		if (m === null)
			m = [];
		let ret = null;
		for (let i=0; i<m.length; i++) {
			let meaning = time.tokenMeaning(m[i]);
			if (ret === null || order.indexOf(ret.meaning) > order.indexOf(meaning))
				ret = {
					token: m[i],
					meaning: meaning
				}
		}
		return ret;
	},

	nextShortestToken(format) {
		let order = [ "milliseconds", "seconds", "minutes", "hours", "date", "month", "year" ];
		let token = time.shortestToken(format);
		token = order.indexOf(token.meaning);
		if (token === -1 || token === 0)
			return null;
		return order[token-1];
	},

	longestToken(format) {
		let tokens = [
			"YYYY", "YY", "MM", "M", "DD", "D", "HH", "H", "hh", "h", "mm", "m", "ss", "s",
			"CC", "Cc", "cc", "mmm", "MMM", "AP", "Am", "ap"
		];
		let order = [ "milliseconds", "seconds", "minutes", "hours", "date", "month", "year" ];
		tokens.sort((a, b) => b.length - a.length);
		// first, extract all tokens
		let tokenRegexp = new RegExp("(?<![a-zA-Z])(" + tokens.join("|") + ")(?![a-zA-Z])", "g");
		let m = format.match(tokenRegexp);
		if (m === null)
			m = [];
		let ret = null;
		for (let i=0; i<m.length; i++) {
			let meaning = time.tokenMeaning(m[i]);
			if (ret === null || order.indexOf(ret.meaning) < order.indexOf(meaning))
				ret = {
					token: m[i],
					meaning: meaning
				}
		}
		return ret;
	},

	nextLongestToken(format) {
		let order = [ "milliseconds", "seconds", "minutes", "hours", "date", "month", "year" ];
		let token = time.longestToken(format);
		token = order.indexOf(token.meaning);
		if (token === -1 || token >= order.length-1)
			return null;
		return order[token+1];
	},

	listTokens(format) {
		let tokens = [
			"YYYY", "YY", "MM", "M", "DD", "D", "HH", "H", "hh", "h", "mm", "m", "ss", "s",
			"CC", "Cc", "cc", "mmm", "MMM", "AP", "Am", "ap"
		];
		tokens.sort((a, b) => b.length - a.length);
		// first, extract all tokens
		let tokenRegexp = new RegExp("(?<![a-zA-Z])(" + tokens.join("|") + ")(?![a-zA-Z])", "g");
		let m = format.match(tokenRegexp);
		if (m === null)
			m = [];
		return m.map((item) => time.tokenMeaning(item));
	},

	/*
	 * Format a single time token such as YYYY or mm
	 * TODO: support for different locales
	 * Tokens:
	 * - YYYY: four-digit year
	 * - YY: two-digit year
	 * - MM: two digit month, leading zero
	 * - M: one or two digit month (no leading zero)
	 * - MON: three letter month, uppercase
	 * - Mon: three letter month, capitalized
	 * - mon: three letter month, lowercase
	 * - MONTH: full month name, uppercase
	 * - Month: full month name, capitalized
	 * - month: full month name, lowercase
	 * - DD: two digit day of month, leading zero
	 * - D: one or two digit day of month (no leading zero)
	 * - HH: two digit 24-hour format hour, leading zero
	 * - H: one digit 24-hour format hour (no leading zero)
	 * - hh: two digit 12-hour format hour, leading zero
	 * - h: one digit 12-hour format hour (no leading zero)
	 * - mm: two digit minutes, leading zero
	 * - m: one digit minutes, no leading zero
	 * - ss: two digit seconds, leading zero
	 * - s: one digit seconds, no leading zero
	 * - CC: two digit hundreds of a second, rounded up
	 * - Cc: two digit hundreds of a second, rounded to nearest
	 * - cc: two digit hundreds of a second, rounded down
	 * - MMM: three digit milliseconds
	 * - mmm: three digit milliseconds
	 * - AP: AM/PM uppercase
	 * - ap: am/pm lowercase
	 * - WW: two digit week number, leading zero, weeks start on Monday
	 * - W: one digit week number, no leading zero, weeks start on Monday
	 * - ww: two digit week number, leading zero, weeks start on Sunday
	 * - w: one digit week number, no leading zero, weeks start on Sunday
	 * - DW: day of week (always one digit, 7 for Sunday)
	 * - dw: day of week (always one digit, 0 for Sunday)
	 * - DOW: three letter day of week, uppercase
	 * - Dow: three letter day of week, capitalized
	 * - dow: three letter day of week, lowercase
	 * - DAY: full day of week, uppercase
	 * - Day: full day of week, capitalized
	 * - day: full day of week, lowercase
	 */
	formatToken: function (token, date, options) {
		let locale = "en-US";
		let tz;
		if (!options)
			options = {};
		let utc = options.utc;
		let zero = options.zero;
		if (zero === undefined)
			zero = "0";
		if (utc)
			tz = "UTC";
		switch (token) {
			case "YYYY":
				return string.boxLeft(utc ? date.getUTCFullYear() : date.getFullYear(), 4, zero);
			case "YY":
				return string.boxLeft(utc ? date.getUTCFullYear() : date.getFullYear(), 2, zero);
			case "MM":
				return string.boxLeft(utc ? date.getUTCMonth() + 1 : date.getMonth() + 1, 2, zero);
			case "M":
				return "" + (utc ? date.getUTCMonth() + 1 : date.getMonth() + 1);
			case "MON":
				return date.toLocaleString(locale, { month: "short", timeZone: tz }).toUpperCase();
			case "Mon":
				return string.changeCase.capitalizeFirst(date.toLocaleString(locale, { month: "short", timeZone: tz }));
			case "mon":
				return date.toLocaleString(locale, { month: "short", timeZone: tz }).toLowerCase();
			case "MONTH":
				return date.toLocaleString(locale, { month: "long", timeZone: tz }).toUpperCase();
			case "Month":
				return string.changeCase.capitalizeFirst(date.toLocaleString(locale, { month: "long", timeZone: tz }));
			case "month":
				return date.toLocaleString(locale, { month: "long", timeZone: tz }).toLowerCase();
			case "DD":
				return string.boxLeft(utc ? date.getUTCDate() : date.getDate(), 2, zero);
			case "D":
				return "" + (utc ? date.getUTCDate() : date.getDate());
			case "HH":
				return string.boxLeft(utc ? date.getUTCHours() : date.getHours(), 2, zero);
			case "H":
				return "" + (utc ? date.getUTCHours() : date.getHours());
			case "hh":
				let hours = (utc ? date.getUTCHours() : date.getHours()) % 12;
				return string.boxLeft(hours ? hours : 12, 2, zero);
			case "h":
				return "" + ((utc ? date.getUTCHours() : date.getHours()) % 12);
			case "mm":
				return string.boxLeft(utc ? date.getUTCMinutes() : date.getMinutes(), 2, zero);
			case "m":
				return "" + (utc ? date.getUTCMinutes() : date.getMinutes());
			case "ss":
				return string.boxLeft(utc ? date.getUTCSeconds() : date.getSeconds(), 2, zero);
			case "s":
				return "" + (utc ? date.getUTCSeconds() : date.getSeconds());
			case "CC": {
				let ms = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
				return string.boxLeft(Math.ceil(ms/10), 2, zero);
			}
			case "Cc": {
				let ms = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
				return string.boxLeft(Math.round(ms/10), 2, zero);
			}
			case "cc": {
				let ms = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
				return string.boxLeft(Math.floor(ms/10), 2, zero);
			}
			case "MMM":
			case "mmm":
				return string.boxLeft(utc ? date.getUTCMilliseconds() : date.getMilliseconds(), 3, zero);
			case "AP":
				return (utc ? date.getUTCHours() : date.getHours()) < 12 ? "AM" : "PM";
			case "ap":
				return (utc ? date.getUTCHours() : date.getHours()) < 12 ? "am" : "pm";
			case "WW":
				return string.boxLeft(time.getWeekNumber(date, utc, true), 2, zero);
			case "W":
				return "" + time.getWeekNumber(date, utc, true);
			case "ww":
				return string.boxLeft(time.getWeekNumber(date, utc, false), 2, zero);
			case "w":
				return "" + time.getWeekNumber(date, utc, false);
			case "DW":
				let ret = utc ? date.getUTCDay() : date.getDay();
				return "" + (ret ? ret : 7);
			case "dw":
				return "" + (utc ? date.getUTCDay() : date.getDay());
			case "DOW":
				return date.toLocaleString(locale, { weekday: "short", timeZone: tz }).toUpperCase();
			case "Dow":
				return string.changeCase.capitalizeFirst(date.toLocaleString(locale, { weekday: "short", timeZone: tz }));
			case "dow":
				return date.toLocaleString(locale, { weekday: "short", timeZone: tz }).toLowerCase();
			case "DAY":
				return date.toLocaleString(locale, { weekday: "long", timeZone: tz }).toUpperCase();
			case "Day":
				return string.changeCase.capitalizeFirst(date.toLocaleString(locale, { weekday: "long", timeZone: tz }));
			case "day":
				return date.toLocaleString(locale, { weekday: "long", timeZone: tz }).toLowerCase();
		}
		return token;
	},

	/*
	 * Format a date object according to format string
	 * Format string can contain any number of tokens, as long as they are separated by
	 * non-alphabetical characters (numbers, spaces, symbols are allowed)
	 * TODO: support for different locales
	 * Tokens:
	 * - YYYY: four-digit year
	 * - YY: two-digit year
	 * - MM: two digit month, leading zero
	 * - M: one or two digit month (no leading zero)
	 * - MON: three letter month, uppercase
	 * - Mon: three letter month, capitalized
	 * - mon: three letter month, lowercase
	 * - MONTH: full month name, uppercase
	 * - Month: full month name, capitalized
	 * - month: full month name, lowercase
	 * - DD: two digit day of month, leading zero
	 * - D: one or two digit day of month (no leading zero)
	 * - HH: two digit 24-hour format hour, leading zero
	 * - H: one digit 24-hour format hour (no leading zero)
	 * - hh: two digit 12-hour format hour, leading zero
	 * - h: one digit 12-hour format hour (no leading zero)
	 * - mm: two digit minutes, leading zero
	 * - m: one digit minutes, no leading zero
	 * - ss: two digit seconds, leading zero
	 * - s: one digit seconds, no leading zero
	 * - CC: two digit hundreds of a second, rounded up
	 * - Cc: two digit hundreds of a second, rounded to nearest
	 * - cc: two digit hundreds of a second, rounded down
	 * - MMM: three digit milliseconds
	 * - mmm: three digit milliseconds
	 * - AP: AM/PM uppercase
	 * - ap: am/pm lowercase
	 * - WW: two digit week number, leading zero, weeks start on Monday
	 * - W: one digit week number, no leading zero, weeks start on Monday
	 * - ww: two digit week number, leading zero, weeks start on Sunday
	 * - w: one digit week number, no leading zero, weeks start on Sunday
	 * - DW: day of week (always one digit, 7 for Sunday)
	 * - dw: day of week (always one digit, 0 for Sunday)
	 * - DOW: three letter day of week, uppercase
	 * - Dow: three letter day of week, capitalized
	 * - dow: three letter day of week, lowercase
	 * - DAY: full day of week, uppercase
	 * - Day: full day of week, capitalized
	 * - day: full day of week, lowercase
	 */
	formatDate: function (format, date, options) {
		if (!options)
			options = {};
		let tokens = [
			"YYYY", "YY", "MM", "M", "MON", "Mon", "mon", "MONTH", "Month", "month",
			"DD", "D", "HH", "H", "hh", "h", "mm", "m", "ss", "s", "CC", "Cc", "cc", "mmm", "MMM", "AP", "ap",
			"WW", "W", "ww", "w", "DW", "dw", "DOW", "Dow", "dow", "DAY", "Day", "day"
		];
		tokens.sort((a, b) => b.length - a.length);
		for (let i=0; i<tokens.length; i++)
			format = format.replace(
				new RegExp("(?<![a-zA-Z])" + tokens[i] + "(?![a-zA-Z])", "g"),
				time.formatToken(tokens[i], date, options)
			);
		return format;
	},

	/*
	 * Get a Date object represented by specific Date/Time string
	 * Unspecified values will be set to current values
	 * String can contain any number of tokens and will be checked against input
	 * Date is either in UTC timezone or local timezone, any other specified timezone
	 * will be disregarded
	 * If no format is specified (null, undefined), the Date parser will be used and
	 * the date object created will have the local date and time values expressed in
	 * either the local or UTC timezone, depending on the options object
	 * If the string passed to the Date parser contains timezone information, local
	 * values will be used and assigned to either local or UTC timezone
	 * (instead of the specified timezone in the date string)
	 * Tokens:
	 * - YYYY: four-digit year
	 * - YYY: four- or two-digit year
	 * - YY: two-digit year
	 * - MM: two digit month, leading zero
	 * - M: one or two digit month (no leading zero)
	 * - DD: two digit day of month, leading zero
	 * - D: one or two digit day of month (no leading zero)
	 * - HH: two digit 24-hour format hour, leading zero
	 * - H: one digit 24-hour format hour (no leading zero)
	 * - hh: two digit 12-hour format hour, leading zero
	 * - h: one digit 12-hour format hour (no leading zero)
	 * - mm: two digit minutes, leading zero
	 * - m: one digit minutes, no leading zero
	 * - ss: two digit seconds, leading zero
	 * - s: one digit seconds, no leading zero
	 * - CC: two digit hundreds of a second
	 * - Cc: two digit hundreds of a second
	 * - cc: two digit hundreds of a second
	 * - MMM: three digit milliseconds
	 * - mmm: three digit milliseconds
	 * - AP: AM/PM uppercase
	 * - Ap: AM/PM any case
	 * - ap: am/pm lowercase
	 */
	parseDate: function (format, string, options) {
		if (!options)
			options = {};
		let utc = options.utc;
		if (!format)
			return time.fromDateString(string, options);
		return time.fromTokenString(format, string, options);
	},

	fromTokenString: function(format, string, options) {
		if (!options)
			options = {};
		let utc = options.utc;
		let full = options.fullMatch;
		let initialFormat = format;
		let tokens = [
			"YYYY", "YY", "MM", "M", "DD", "D", "HH", "H", "hh", "h", "mm", "m", "ss", "s",
			"CC", "Cc", "cc", "mmm", "MMM", "AP", "Am", "ap"
		];
		tokens.sort((a, b) => b.length - a.length);
		// first, extract all tokens
		let tokenRegexp = new RegExp("(?<![a-zA-Z])(" + tokens.join("|") + ")(?![a-zA-Z])", "g");
		let m = format.match(tokenRegexp);
		if (m === null)
			m = [];
		// replace them with regexp value and create token information array
		let tok = [];
		for (let i=0; i<m.length; i++) {
			let regexpStr = "(" + time.tokenRegexpString(m[i]) + ")";
			format = format.replace(m[i], regexpStr);
			tok.push({
				token: m[i],
				regexp: new RegExp("(?<![a-zA-Z])" + regexpStr + "(?![a-zA-Z])")
			});
		}
		if (full)
			format = "^" + format + "$";
		format = new RegExp(format, "g");
		// extract date information from string
		string = string.match(format);
		if (string === null)
			return new Date("");
		string = string[0];
		// now extract tokens one by one
		for (let i=0; i<tok.length; i++) {
			m = string.match(tok[i].regexp);
			if (m === null)
				break;
			tok[i].value = m[0];
			string = string.replace(tok[i].regexp, tok[i].token);
		}
		// check that everything has been extracted
		if (string !== initialFormat)
			return new Date("");
		let ret = time.fromDateString(null, options);
		for (let i=0; i<tok.length; i++)
			time.applyTokenValue(ret, tok[i].token, tok[i].value, utc);
		return ret;
	},

	fromDateString: function (string, options) {
		if (!options)
			options = {};
		let utc = options.utc;
		let date;
		if (string)
			date = new Date(string);
		else
			date = new Date();
		if (!utc)
			return date;
		let ret = new Date();
		ret.setUTCFullYear(date.getFullYear());
		ret.setUTCMonth(date.getMonth());
		ret.setUTCDate(date.getDate());
		ret.setUTCHours(date.getHours());
		ret.setUTCMinutes(date.getMinutes());
		ret.setUTCSeconds(date.getSeconds());
		ret.setUTCMilliseconds(date.getMilliseconds());
		return ret;
	},

	buildDateFormats: function () {
		// list of generic time formats to try with
		let generics = [
			"<D>-<M>-<Y> <h>:<m>:<s>.<ms> <a>",
			"<Y>-<M>-<D> <h>:<m>:<s>.<ms> <a>",
			"<D>-<M>-<Y> <h>:<m>:<s>.<ms>",
			"<Y>-<M>-<D> <h>:<m>:<s>.<ms>",
			"<D>-<M>-<Y> <h>:<m>:<s> <a>",
			"<Y>-<M>-<D> <h>:<m>:<s> <a>",
			"<D>-<M>-<Y> <h>:<m>:<s>",
			"<Y>-<M>-<D> <h>:<m>:<s>",
			"<D>-<M>-<Y> <h>:<m> <a>",
			"<Y>-<M>-<D> <h>:<m> <a>",
			"<D>-<M>-<Y> <h>:<m>",
			"<Y>-<M>-<D> <h>:<m>",
			"<D>-<M> <h>:<m>:<s>.<ms> <a>",
			"<M>-<D> <h>:<m>:<s>.<ms> <a>",
			"<D>-<M> <h>:<m>:<s>.<ms>",
			"<M>-<D> <h>:<m>:<s>.<ms>",
			"<D>-<M> <h>:<m>:<s> <a>",
			"<M>-<D> <h>:<m>:<s> <a>",
			"<D>-<M> <h>:<m>:<s>",
			"<M>-<D> <h>:<m>:<s>",
			"<D>-<M> <h>:<m> <a>",
			"<M>-<D> <h>:<m> <a>",
			"<D>-<M> <h>:<m>",
			"<M>-<D> <h>:<m>"
		];
		// list of tokens to replace and possible values
		let replace = [
			[ "<Y>", [ "YYYY", "YY" ]],
			[ "<M>", [ "MM", "M" ]],
			[ "<D>", [ "DD", "D" ]],
			[ "<h>", [ "HH", "H" ]],
			[ "<m>", [ "mm", "m" ]],
			[ "<s>", [ "ss", "s" ]],
			[ "<ms>", [ "mmm", "cc" ]],
			[ "<a>", [ "AP", "ap" ]],
			[ "<1>", [ "\\-", "\\.", "/", "\\\\" ]],
			[ "<2>", [ ":" ]],
			[ "<3>", [ "\\." ]]
		];
		// to avoid regexp replace collisions, replace all separators with tokens
		// (it's visually better to have them as separators when the generic strings are defined)
		let separators = {
			"<1>": [ "-" ],
			"<2>": [ ":" ],
			"<3>": [ "." ]
		};
		let regexpStr = {};

		for (let i=0; i<generics.length; i++) {
			for (let j in separators) {
				for (let k=0; k<separators.length; k++) {
					generics[i] = generics[i].replace(new RegExp(separators[j][k], "g"), j);
				}
			}
		}

		for (let i=0; i<replace.length; i++) {
			for (let j=0; j<replace[i][1].length; j++) {
				regexpStr[replace[i][1][j]] = "(" + time.tokenRegexpString(replace[i][1][j]) + ")";
			}
		}

		function replaceTokens (input, tokens, index) {
			if (index >= tokens.length)
				return input;
			let res = [];
			let tok = tokens[index];
			for (let i=0; i<input.length; i++) {
				for (let j=0; j<tok[1].length; j++) {
					let toPush = input[i].replace(new RegExp(tok[0], "g"), tok[1][j]);
					if (res.indexOf(toPush) === -1)
						res.push(toPush);
				}
			}
			return replaceTokens(res, tokens, index + 1);
		}

		let formats = replaceTokens (generics, replace, 0);

		time.DATE_FORMATS = {};
		for (let i=0; i<formats.length; i++) {
			let format = formats[i];
			for (let j in regexpStr)
				format = format.replace(new RegExp(j.replace(/\\/g, "\\\\"), "g"), regexpStr[j]);
			format = "(?<![0-9.\\-/\\\\:])" + format + "(?![0-9.\\-/\\\\:])";
			time.DATE_FORMATS[formats[i]] = new RegExp(format, "g");
		}
	},

	formatRootVariant: function (format) {
		let variants = {
			"MM": [ "M" ],
			"DD": [ "D" ],
			"HH": [ "H", "hh", "h" ],
			"mm": [ "m" ],
			"ss": [ "s" ]
		};

		for (let i in variants)
			for (let j in variants[i])
				format = format.replace(new RegExp("(?<![a-zA-Z])" + variants[i][j] + "(?![a-zA-Z])", "g"), i);

		return format;
	},

	// detect the formats available in a date string
	detectDateFormats: function (str, allVariants) {
		if (!time.DATE_FORMATS) {
			time.buildDateFormats();
		}
		let ret = [];
		let formats = time.DATE_FORMATS;
		for (let i in formats) {
			if (str.match(formats[i]) !== null) {
				if (!allVariants) {
					let rootVariant = time.formatRootVariant(i);
					if (ret.indexOf(rootVariant) !== -1)
						continue;
				}
				ret.push(i);
			}
		}
		return ret;
	},

	// from number and unit, such as '1 year'
	literalToTime: function (str) {
		str = str.split(" ");
		if (str.length === 1)
			return parseInt(str);
		let ret = parseFloat(str[0]);
		str[1] = str[1].toLowerCase();
		switch (str[1]) {
			case "y":
			case "year":
			case "years":
				ret *= 12;
			case "mon":
			case "month":
			case "months":
				ret *= 30;
			case "d":
			case "day":
			case "days":
				ret *= 24;
			case "h":
			case "hr":
			case "hour":
			case "hours":
				ret *= 60;
			case "m":
			case "min":
			case "minute":
			case "minutes":
				ret *= 60;
			case "s":
			case "second":
			case "seconds":
				ret *= 1000;
			case "ms":
			case "millisecond":
			case "milliseconds":
				return ret;
		}
		return NaN;
	},

	currentUnixTime: function() {
		return (new Date()).getTime();
	},

	currentTime: function() {
	},

	currentDate: function() {
	},

	timezoneOffset: function () {
		return (new Date()).getTimezoneOffset() / 60;
	},

	lastMidnight: function () {
	},

	timeFromStringToday: function (str) {

	},

	DATE_FORMATS: null

};

module.exports  = time;

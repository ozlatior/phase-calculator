/*
 * Local Time Class
 */

const time = require("./time.js");

class TimeOne {

	constructor (timezoneOffset, timezoneName) {
		// copy constructor
		if (timezoneOffset instanceof TimeOne) {
			this.copyFrom(timezoneOffset);
			return;
		}
		if (timezoneOffset === undefined || timezoneOffset === null)
			this.setCurrentTimezone();
		else
			this.setTimezone(timezoneOffset, timezoneName);
		this.time = null;
		this.offset = null;
		this.locale = "en-US";
		this.format = {
			time: "HH:mm:ss",
			date: "DD-MM-YYYY",
			datetime: "DD-MM-YYYY HH:mm:ss"
		};
	}

	copyFrom (timeOne) {
		this.tz = timeOne.tz;
		this.tzName = timeOne.tzName;
		this.time = timeOne.time;
		this.offset = timeOne.offset;
		this.locale = timeOne.locale;
		this.format = JSON.parse(JSON.stringify(timeOne.format));
	}

	clone () {
		return new TimeOne(this);
	}

	getTimezoneOffset () {
		return this.tz;
	}

	getTimezoneName () {
		return this.tzName;
	}

	getTimezoneGeneric () {
		return time.genericTimezoneString(this.tz);
	}

	setCurrentTimezone () {
		let d = new Date();
		this.tz = - d.getTimezoneOffset() / 60;
		this.tzName = d.toTimeString().split(" ").slice(1).join(" ");
	}

	setTimezone (timezoneOffset, timezoneName) {
		this.tz = timezoneOffset;
		if (timezoneName)
			this.tzName = timezoneName;
		else
			this.tzName = time.genericTimezoneString(this.tz);
	}

	setTimezoneName (timezoneName) {
		this.tzName = timezoneName;
	}

	setLocale (locale) {
		this.locale = locale;
	}

	setFormat (date, time) {
		this.format.date = date;
		this.format.time = time;
		this.format.datetime = date + " " + time;
	}

	setDateFormat (date) {
		this.format.date = date;
	}

	setTimeFormat (time) {
		this.format.time = time;
	}

	setDateTimeFormat (datetime) {
		this.format.datetime = datetime;
	}

	// Make this a current time object
	setCurrent () {
		this.time = null;
		this.offset = null;
	}

	// Make this a static snapshot of the current time
	setCurrentStatic () {
		this.time = null;
		this.offset = null;
		this.stop();
	}

	// Set date and time in the UTC timezone
	// TODO: format warnings, use Date format in case of failure
	setUtcStatic (d, format) {
		if (!format)
			format = time.detectDateFormats(d)[0];
		let date = time.parseDate(format, d, { utc: true, fullMatch: true });
		this.time = date.getTime();
	}

	// Set cursive date and time in the UTC timezone
	setUtcCursive (d, format) {
		if (!format)
			format = time.detectDateFormats(d)[0];
		this.offset =
			time.parseDate(format, d, { utc: true, fullMatch: true }).getTime() -
			(new Date()).getTime();
	}

	// Set date and time in local (currently set) timezone
	setLocalStatic (d, format) {
		if (!format)
			format = time.detectDateFormats(d)[0];
		let date = time.parseDate(format, d, { utc: true, fullMatch: true });
		this.setTranslatedLocalTime(date.getTime());
	}

	// Set cursive date and time in local (currently set) timezone
	setLocalCursive (d, format) {
		if (!format)
			format = time.detectDateFormats(d)[0];
		this.offset = 1;
		this.setTranslatedLocalTime(time.parseDate(format, d, { utc: true, fullMatch: true }).getTime());
	}

	isCurrent () {
		return (this.time === null && this.offset === null);
	}

	isStatic () {
		return (this.time !== null && this.offset === null);
	}

	isCursive () {
		return (this.time === null && this.offset !== null);
	}

	// Time Value Getters
	getYear (utc) {
		if (utc)
			return (new Date(this.getUnixTime())).getUTCFullYear();
		return (new Date(this.getTranslatedLocalTime())).getUTCFullYear();
	}

	getMonth (utc) {
		if (utc)
			return (new Date(this.getUnixTime())).getUTCMonth() + 1;
		return (new Date(this.getTranslatedLocalTime())).getUTCMonth() + 1;
	}

	getDate (utc) {
		if (utc)
			return (new Date(this.getUnixTime())).getUTCDate();
		return (new Date(this.getTranslatedLocalTime())).getUTCDate();
	}

	getHours (utc) {
		if (utc)
			return (new Date(this.getUnixTime())).getUTCHours();
		return (new Date(this.getTranslatedLocalTime())).getUTCHours();
	}

	getMinutes (utc) {
		if (utc)
			return (new Date(this.getUnixTime())).getUTCMinutes();
		return (new Date(this.getTranslatedLocalTime())).getUTCMinutes();
	}

	getSeconds (utc) {
		if (utc)
			return (new Date(this.getUnixTime())).getUTCSeconds();
		return (new Date(this.getTranslatedLocalTime())).getUTCSeconds();
	}

	getMilliseconds (utc) {
		if (utc)
			return (new Date(this.getUnixTime())).getUTCMilliseconds();
		return (new Date(this.getTranslatedLocalTime())).getUTCMilliseconds();
	}

	getTimestamp (utc) {
		if (utc)
			return this.getUnixTime();
		return this.getTranslatedLocalTime();
	}

	getByToken (token, utc) {
		token = time.tokenMeaning(token).split("/")[0];
		switch (token) {
			case "year":
				return this.getYear(utc);
			case "month":
				return this.getMonth(utc);
			case "date":
				return this.getDate(utc);
			case "hours":
				return this.getHours(utc);
			case "minutes":
				return this.getMinutes(utc);
			case "seconds":
				return this.getSeconds(utc);
			case "hundredths":
				return parseInt(this.getMilliseconds(utc) / 10);
			case "milliseconds":
				return this.getMilliseconds(utc);
		}
	}

	// Time Value Setters
	setYear (value, utc) {
		let date = new Date(this.getTimestamp(utc));
		date.setUTCFullYear(value);
		this.setTimestamp(date.getTime(), utc);
	}

	setMonth (value, utc) {
		let date = new Date(this.getTimestamp(utc));
		date.setUTCMonth(value - 1);
		this.setTimestamp(date.getTime(), utc);
	}

	setDate (value, utc) {
		let date = new Date(this.getTimestamp(utc));
		date.setUTCDate(value);
		this.setTimestamp(date.getTime(), utc);
	}

	setHours (value, utc) {
		let date = new Date(this.getTimestamp(utc));
		date.setUTCHours(value);
		this.setTimestamp(date.getTime(), utc);
	}

	setMinutes (value, utc) {
		let date = new Date(this.getTimestamp(utc));
		date.setUTCMinutes(value);
		this.setTimestamp(date.getTime(), utc);
	}

	setSeconds (value, utc) {
		let date = new Date(this.getTimestamp(utc));
		date.setUTCSeconds(value);
		this.setTimestamp(date.getTime(), utc);
	}

	setMilliseconds (value, utc) {
		let date = new Date(this.getTimestamp(utc));
		date.setUTCMilliseconds(value);
		this.setTimestamp(date.getTime(), utc);
	}

	setTimestamp (value, utc) {
		if (utc)
			return this.setUnixTime(value);
		return this.setTranslatedLocalTime(value);
	}

	setByToken (token, value, utc) {
		token = time.tokenMeaning(token).split("/")[0];
		switch (token) {
			case "year":
				return this.setYear(value, utc);
			case "month":
				return this.setMonth(value, utc);
			case "date":
				return this.setDate(value, utc);
			case "hours":
				return this.setHours(value, utc);
			case "minutes":
				return this.setMinutes(value, utc);
			case "seconds":
				return this.setSeconds(value, utc);
			case "hundredths":
				return this.setMilliseconds(value * 10, utc);
			case "milliseconds":
				return this.setMilliseconds(value, utc);
		}
	}

	setZero (token, options) {
		if (!options)
			options = {};
		let utc = options.utc;
		switch (token) {
			case "year":
				if (!options.cascade)
					return this.setYear(0, utc);
				this.setYear(0, utc);
			case "month":
				if (!options.cascade)
					return this.setMonth(1, utc);
				this.setMonth(1, utc);
			case "date":
				if (!options.cascade)
					return this.setDate(1, utc);
				this.setDate(1, utc);
			case "hours":
				if (!options.cascade)
					return this.setHours(0, utc);
				this.setHours(0, utc);
			case "minutes":
				if (!options.cascade)
					return this.setMinutes(0, utc);
				this.setMinutes(0, utc);
			case "seconds":
				if (!options.cascade)
					return this.setSeconds(0, utc);
				this.setSeconds(0, utc);
			case "hundredths":
			case "milliseconds":
				return this.setMilliseconds(0, utc);
		}
	}

	// Set the clock forward by millisecond offset (or other unit if specified)
	setForward (offset, unit) {
		if (unit)
			offset *= unit;
		// it's a static clock, so we add the offset to time
		if (this.time) {
			this.time += offset;
			return;
		}
		// it's a cursive clock, so we add the offset to the current offset
		if (this.offset) {
			this.offset += offset;
			return;
		}
		// it's a current time clock, we turn it into an offset clock
		this.offset = offset;
	}

	// set forward by n months
	setForwardByMonths (n) {
		let date = new Date(this.getUnixTime());
		let m = date.getUTCMonth() + n;
		let y = Math.floor(m / 12);
		if (m > 0)
			date.setUTCMonth(m % 12);
		if (m < 0)
			date.setUTCMonth(m % 12 + 12);
		if (y)
			date.setUTCFullYear(date.getUTCFullYear() + y);
		this.setUnixTime(date.getTime());
	}

	// set forward by n years
	setForwardByYears (n) {
		let date = new Date(this.getUnixTime());
		date.setUTCFullYear(date.getUTCFullYear() + n);
		this.setUnixTime(date.getTime());
	}

	// Set the clock back by millisecond offset (or other unit if specified)
	setBack (offset, unit) {
		return this.setForward(-offset, unit);
	}

	// set back by n months
	setBackByMonths (n) {
		return this.setForwardByMonths(-n);
	}

	// set back by n years
	setBackByYears (n) {
		return this.setForwardByYears(-n);
	}

	// Set the clock to current time as specified by format string, not changing other values
	// If sharp is set to true, set everything after set values to zero
	// eg, for a string of "HH:mm", setCurrent("12:00", "HH:mm", sharp) will
	// - leave the days, month and year unchanged
	// - set the time of day to 12:00 (current day)
	// - set the seconds and milliseconds to zero if sharp is true
	setCurrent (format, timestr, options) {
		if (!options)
			options = {};
		let setTo = new TimeOne();
		let date = time.parseDate(format, timestr, { utc: true, fullMatch: true });
		setTo.setUnixTime(date.getTime());
		let tokens = time.listTokens(format);
		for (let i=0; i<tokens.length; i++)
			this.setByToken(tokens[i], setTo.getByToken(tokens[i], true), options.utc);
		if (options.sharp) {
			let shortest = time.nextShortestToken(format);
			this.setZero(shortest, { utc: options.utc, cascade: true });
		}
	}

	// Set the clock to the previous time defined by format and string value
	// eg previous 2:00 AM, previous date of 2nd of the month, etc
	// preserves other values, but resets the smaller units if sharp is set in options
	setPrevious (format, timestr, options) {
		let oldTime = this.getUnixTime();
		this.setCurrent(format, timestr, options);
		if (this.getUnixTime() > oldTime) {
			// we have pushed the time to the future so we have to move it back
			let longest = time.nextLongestToken(format);
			switch (longest) {
				case "seconds":
				case "minutes":
				case "hours":
				case "date":
					this.setBack(1, TimeOne.stringToUnit(longest));
					break;
				case "month":
					this.setBackByMonths(1);
					break;
				case "year":
					this.setBackByYears(1);
					break;
			}
		}
	}

	// Set the clock to the next time defined by format and string value
	// eg next 2:00 AM, next date of 2nd of the month, etc
	// preserves other values, but resets the smaller units if sharp is set in options
	setNext (format, timestr, options) {
		let oldTime = this.getUnixTime();
		this.setCurrent(format, timestr, options);
		if (this.getUnixTime() < oldTime) {
			// we have pushed the time to the past so we have to move it forward
			let longest = time.nextLongestToken(format);
			switch (longest) {
				case "seconds":
				case "minutes":
				case "hours":
				case "date":
					this.setForward(1, TimeOne.stringToUnit(longest));
					break;
				case "month":
					this.setForwardByMonths(1);
					break;
				case "year":
					this.setForwardByYears(1);
					break;
			}
		}
	}

	// Compare times taking timezone into account
	timeTo (time) {
		return time.getUnixTime() - this.getUnixTime();
	}

	isBefore (time) {
		return (this.timeTo(time) > 0);
	}

	isAfter (time) {
		return (this.timeTo(time) < 0);
	}

	isBetween (time1, time2, strict) {
		if (!strict && (this.isSame(time1) || this.isSame(time2)))
			return true;
		return this.isAfter(time1) && this.isBefore(time2)
	}

	isSame (time, precision) {
		return (Math.abs(this.timeTo(time)) <= precision);
	}

	// if this is a current or offset clock, freeze it to current time
	stop() {
		this.time = this.getUnixTime();
		this.offset = null;
	}

	// if this is a static clock, turn it into a cursive (offset) clock
	start() {
		if (this.time === null)
			return;
		this.offset = this.time - (new Date()).getTime();
		this.time = null;
	}

	getUnixTime () {
		if (this.time)
			return this.time;
		let current = (new Date()).getTime();
		if (this.offset)
			current += this.offset;
		return current;
	}

	getTranslatedLocalTime () {
		return this.getUnixTime() + this.tz * TimeOne.HOUR;
	}

	setUnixTime (time) {
		if (this.isStatic())
			this.time = time;
		else {
			let current = (new Date()).getTime();
			this.offset = time - current;
		}
	}

	setTranslatedLocalTime (time) {
		return this.setUnixTime(time - this.tz * TimeOne.HOUR);
	}

	toDateObject () {
		return new Date(this.getUnixTime());
	}

	toTimeString (utc, what) {
		let t;
		if (utc)
			t = this.getUnixTime();
		else
			t = this.getTranslatedLocalTime();
		switch (what) {
			case "date":
				return time.formatDate(this.format.date, new Date(t), { utc: true });
			case "time":
				return time.formatDate(this.format.time, new Date(t), { utc: true });
		}
		return time.formatDate(this.format.datetime, new Date(t), { utc: true });
	}

}

/*
 * "Static" values and methods
 */

TimeOne.MILLISECOND	= 1;
TimeOne.SECOND		= 1000;
TimeOne.MINUTE		= 1000 * 60;
TimeOne.HOUR		= 1000 * 60 * 60;
TimeOne.DAY			= 1000 * 60 * 60 * 24;
TimeOne.WEEK		= 1000 * 60 * 60 * 24 * 7;

TimeOne.stringToUnit = function (str) {
	str = str.toLowerCase();
	switch (str) {
		case "ms":
		case "millisecond":
		case "milliseconds":
			return TimeOne.MILLISECOND;
		case "s":
		case "sec":
		case "second":
		case "seconds":
			return TimeOne.SECOND;
		case "m":
		case "min":
		case "minute":
		case "minutes":
			return TimeOne.MINUTE;
		case "h":
		case "hr":
		case "hour":
		case "hours":
			return TimeOne.HOUR;
		case "d":
		case "day":
		case "days":
		case "date":
			return TimeOne.DAY;
		case "w":
		case "week":
		case "weeks":
			return TimeOne.WEEK;
	}
	return -1;
}

TimeOne.fromString = function (str, timezone) {
	let ret = new TimeOne();
	if (timezone === "utc")
		ret.setTimezone(0);
	if (typeof(timezone) === "number")
		ret.setTimezone(timezone);
	ret.setLocalStatic(str);
	return ret;
}

TimeOne.fromUnixTime = function(time, timezone) {
	let ret = new TimeOne();
	if (timezone === "utc")
		ret.setTimezone(0);
	if (typeof(timezone) === "number")
		ret.setTimezone(timezone);
	ret.setUnixTime(time);
	return ret;
}

module.exports = TimeOne;

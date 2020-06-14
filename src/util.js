const util = {

	defaultPrecision: 3,

	// get an object containing the exponents of each prime divider for number
	// (as long as the exponent is not zero)
	getPrimeDividers (number) {
		let ret = {};
		for (let i=2; i<=number; i++) {
			while (number % i === 0) {
				if (ret[i] === undefined)
					ret[i] = 0;
				ret[i]++;
				number /= i;
			}
		}
		return ret;
	},

	// scale an array so that all values are natural numbers, least possible values
	// and return the scale factor
	// 0.2, 0.3 -> 2, 3 (scale = 10)
	// 0.2, 0.4 -> 1, 2 (scale = 5)
	scaleToNaturalNumbers: function (arr, precision) {
		if (!precision)
			precision = util.defaultPrecision;
		let scales = [];
		let ref = Math.pow(10, precision);
		let min = 1e99;
		for (let i=0; i<arr.length; i++) {
			let scale = Math.round(arr[i] * ref) % ref;
			scales.push(scale);
			if (scale < min)
				min = scale;
		}
		scales.push(ref);
		let gcd = util.greatestCommonDivider(scales);
		let scale = ref / gcd;
		for (let i=0; i<arr.length; i++)
			arr[i] *= scale;
		return scale;
	},

	// get least common multiple for an array of real numbers (or natural if precision
	// is set to false)
	leastCommonMultiple: function (values, precision) {
		if (precision === undefined)
			precision = util.defaultPrecision;
		values = values.slice(0);
		let scale = 1;
		if (precision)
			scale = util.scaleToNaturalNumbers(values);
		let primes = values.map((item) => util.getPrimeDividers(item));
		// compile lcm exponent powers (maximum exponent for each prime factor)
		let lcmExponents = {};
		for (let i=0; i<primes.length; i++) {
			for (let j in primes[i]) {
				if (lcmExponents[j] === undefined || lcmExponents[j] < primes[i][j])
					lcmExponents[j] = primes[i][j];
			}
		}
		// compose the lcm from factors and exponents
		let lcm = 1;
		for (let i in lcmExponents)
			lcm *= Math.pow(parseInt(i), lcmExponents[i]);
		// divide by scale
		lcm = lcm / scale;
		return lcm;
	},

	// get the greatest common divider for an array of natural numbers
	greatestCommonDivider: function (values) {
		values = values.slice(0);
		let lcm = util.leastCommonMultiple(values, false);
		let primes = values.map((item) => util.getPrimeDividers(item));
		// compile gcd exponent powers (minimum exponent for each prime factor)
		let gcdExponents = util.getPrimeDividers(lcm);
		for (let i=0; i<primes.length; i++) {
			for (let j in gcdExponents) {
				if (primes[i][j] === undefined || gcdExponents[j] > primes[i][j])
					gcdExponents[j] = primes[i][j];
			}
		}
		// compose the gcd from factors and exponents
		let gcd = 1;
		for (let i in gcdExponents)
			gcd *= gcdExponents[i] === undefined ? 1 : Math.pow(parseInt(i), gcdExponents[i]);
		return gcd;
	},

	// get number of seconds in ...
	secondsIn: function(unit) {
		ret = 1;
		switch (unit) {
			case "year":
			case "years":
				ret *= 365;
			case "day":
			case "days":
				ret *= 24;
			case "hour":
			case "hours":
				ret *= 60;
			case "minute":
			case "minutes":
				ret *= 60;
		}
		return ret;
	},

	// time in seconds from string
	timeInSeconds: function(str) {
		str = str.split(" ");
		let multiplier = util.secondsIn(str[1]);
		return parseFloat(str[0]) * multiplier;
	},

	// time in minutes from string
	timeInMinutes: function(str) {
		return util.timeInSeconds(str) / 60;
	}

};

module.exports = util;

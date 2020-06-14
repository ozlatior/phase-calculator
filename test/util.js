const assert = require("assert");

const util = require("../src/util.js");

describe ("utility functions", () => {

	describe ("scaleToNaturalNumbers", () => {
	
		it ("returns the scale for single value", () => {
			let input = [ 0.3 ];
			let expected = 10;
			assert.equal(util.scaleToNaturalNumbers(input), expected);
		});

		it ("returns the scale for same value", () => {
			let input = [ 0.3, 0.3, 0.3 ];
			let expected = 10;
			assert.equal(util.scaleToNaturalNumbers(input), expected);
		});
	
		it ("returns the scale for set of different values", () => {
			let input = [ 0.2, 0.4, 2.2 ];
			let expected = 5;
			assert.equal(util.scaleToNaturalNumbers(input), expected);
		});

	});

	describe ("leastCommonMultiple", () => {
	
		it ("returns the number for single value", () => {
			let input = [ 0.3 ];
			let expected = 0.3;
			assert.equal(util.leastCommonMultiple(input), expected);
		});

		it ("returns the number for same value", () => {
			let input = [ 0.3, 0.3, 0.3 ];
			let expected = 0.3;
			assert.equal(util.leastCommonMultiple(input), expected);
		});
	
		it ("returns the number for set of different values", () => {
			let input = [ 0.2, 0.5, 2.5 ];
			let expected = 5;
			assert.equal(util.leastCommonMultiple(input), expected);
		});
	
	});

	describe ("greatestCommonDivider", () => {

		it ("returns the value for a single value", () => {
			let input = [ 15 ];
			let expected = 15;
			assert.equal(util.greatestCommonDivider(input), expected);
		});

		it ("returns the value for multiple same value", () => {
			let input = [ 15, 15, 15 ];
			let expected = 15;
			assert.equal(util.greatestCommonDivider(input), expected);
		});

		it ("returns the correct value for set", () => {
			let input = [ 15, 25, 100 ];
			let expected = 5;
			assert.equal(util.greatestCommonDivider(input), expected);
		});

		it ("returns one for relatively prime numbers", () => {
			let input = [ 15, 49, 64 ];
			let expected = 1;
			assert.equal(util.greatestCommonDivider(input), expected);
		});

		it ("returns one for empty set", () => {
			let input = [ ];
			let expected = 1;
			assert.equal(util.greatestCommonDivider(input), expected);
		});

	});

});

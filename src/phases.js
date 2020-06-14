/*
 * Main Phases Class
 */

const TimeOne = require("./time-one.js");

const util = require("./util.js");

class Phases {

	/*
	 * Constructor argument example
	 * {
	 *	"name": "Jupiter",
	 *	"tzero": <reference unix timestamp (ms)>,
	 *	"objects": {
	 *		"Surface": "10.65 hours",
	 *		"Io": "1.775 days",
	 *		"Europa": "3.550 days",
	 *		"Ganymede": "7.100 days",
	 *		"Callisto": "17.75 days"
	 *	},
	 *	"reference": "Io",
	 *	"steps": 25
	 *}
	 */
	constructor (data) {
		this.name = data.name;

		this.tzero = data.tzero;

		this.objects = {};
		for (let i in data.objects)
			this.objects[i] = util.timeInMinutes(data.objects[i]);

		this.reference = data.reference;
		this.steps = data.steps;
	}

	getName () {
		return this.name;
	}

	getObjectNames () {
		let ret = [];
		for (let i in this.objects)
			ret.push(i);
		return ret;
	}

	getPeriods (unit) {
		if (!unit)
			unit = 1;
		let ret = JSON.parse(JSON.stringify(this.objects));
		for (let i in ret) {
			ret[i] = ret[i] / unit;
		}
		return ret;
	}

	getTZero () {
		return this.tzero;
	}

	getReferenceObject () {
		return this.reference;
	}

	getReferenceSteps () {
		return this.steps;
	}

	/*
	 * Return the total time interval in minutes for a full rotation of phases
	 */
	getTotalInterval () {
		let periods = [];
		for (let i in this.objects)
			periods.push(this.objects[i]);
		return util.leastCommonMultiple(periods);
	}

	/*
	 * Return the interval length for the reference cycle
	 */
	getReferenceInterval () {
		return this.objects[this.reference];
	}

	/*
	 * Return number of orbits / cycles of the reference object for the total interval
	 */
	getTotalCycleCount () {
		return this.getTotalInterval() / this.getReferenceInterval();
	}

	/*
	 * Return the number of steps for a full rotation of phases
	 */
	getTotalStepCount () {
		return this.getTotalCycleCount() * this.steps;
	}

	/*
	 * Return the length of a single step
	 */
	getStepInterval () {
		return this.getTotalInterval() / this.getTotalStepCount();
	}

	/*
	 * Return an object with multiplier values for each phase relative to the reference phase
	 */
	getPhaseMultipliers () {
		let ret = {};
		for (let i in this.objects) {
			ret[i] = this.objects[this.reference] / this.objects[i];
		}
		return ret;
	}

	/*
	 * Get the phases for all objects corresponding to a specific step
	 */
	getPhases (step) {
		step = step % this.getTotalStepCount();
		let ret = this.getPhaseMultipliers();
		let mul = step / this.steps;
		for (let i in ret)
			ret[i] = (ret[i] * mul) - Math.floor(ret[i] * mul);
		return ret;
	}

	/*
	 * Get the time corresponding to a specific step
	 */
	getStepTime (step) {
		let time = this.tzero;
		time += step * this.getStepInterval() * 60 * 1000;
		return time;
	}

	/*
	 * Get next step for a specific time
	 */
	getNextStep (time, asIndex) {
		let ref = this.tzero;
		time -= ref;
		time /= (60 * 1000);
		let ret = Math.ceil(time / this.getStepInterval());
		if (asIndex)
			ret = ret % this.getTotalStepCount();
		return ret;
	}

	/*
	 * Get previous step for a specific time
	 */
	getPreviousStep (time, asIndex) {
		let ref = this.tzero;
		time -= ref;
		time /= (60 * 1000);
		let ret = Math.floor(time / this.getStepInterval());
		if (asIndex)
			ret = ret % this.getTotalStepCount();
		return ret;
	}

	/*
	 * Get steps in time interval
	 * Start and end are expressed as Unix Timestamps
	 */
	getIntervalSteps (start, end, asIndex) {
		let totalSteps = this.getTotalStepCount();
		let ref = this.tzero;
		start -= ref;
		start /= (60 * 1000);
		start = Math.ceil(start / this.getStepInterval());
		end -= ref;
		end /= (60 * 1000);
		end = Math.floor(end / this.getStepInterval());
		let ret = [];
		for (let i=start; i<=end; i++) {
			if (asIndex) {
				let index = i;
				while (index < 0)
					index += totalSteps;
				ret.push(index % totalSteps);
			}
			else
				ret.push(i);
		}
		return ret;
	}

	/*
	 * Get next time of a specific step, relative to given timestamp
	 */
	getNextTime (step, time) {
		let ret = this.getStepTime(step);
		let totalTime = this.getTotalInterval() * 60 * 1000;
		while (ret < time)
			ret += totalTime;
		return ret;
	}

	/*
	 * Get previous time of a specific step, relative to given timestamp
	 */
	getPreviousTime (step, time) {
		let ret = this.getStepTime(step);
		let totalTime = this.getTotalInterval() * 60 * 1000;
		while (ret > time)
			ret -= totalTime;
		return ret;
	}

	/*
	 * Get nearest time for a specific step
	 */
	getNearestTime (step, time) {
		let prev = this.getPreviousTime(step, time);
		let next = this.getNextTime(step, time);
		if (time - prev <= next - time)
			return prev;
		return next;
	}

}

module.exports = Phases;

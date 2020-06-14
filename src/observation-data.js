/*
 * Observations Data Object Class
 */

class ObservationData {

	constructor (phases) {
		this.objectData = null;
		this.stepCount = 0;
		this.observations = null;
		if (phases)
			this.loadObject(phases);
	}

	loadObject (phases) {
		this.objectData = JSON.parse(JSON.stringify(phases));
		this.stepCount = phases.getTotalStepCount();
		this.observations = [];
		for (let i=0; i<this.stepCount; i++)
			this.observations[i] = [];
	}

	getStepCount () {
		return this.stepCount;
	}

	getObservations (step) {
		if (this.observations === null || step >= this.stepCount)
			return null;
		return this.observations[step];
	}

	addObservation (step, time, details) {
		if (this.observations === null || step >= this.stepCount)
			return null;
		this.observations[step].push({
			time: time,
			timeAdded: (new Date()).getTime(),
			timeUpdated: (new Date()).getTime(),
			details: details
		});
		return this.observations[step];
	}

	removeObservation (step, index) {
		if (this.observations === null || step >= this.stepCount || index >= this.observations[step].length)
			return null;
		this.observations[step].splice(index, 1);
		return this.observations[step];
	}

	removeAllObservations (step) {
		if (this.observations === null || step >= this.stepCount)
			return null;
		this.observations[step] = [];
		return this.observations[step];
	}

	clearObservationData () {
		this.observations = [];
	}

	parseString (str) {
		let data = JSON.parse(str);
		// TODO: compare object data for validation
		this.stepCount = data.stepCount;
		this.observations = data.observations;
	}

	serialize () {
		let ret = {};
		ret.objectData = this.objectData;
		ret.stepCount = this.stepCount;
		ret.observations = this.observations;
		return JSON.stringify(ret);
	}

};

module.exports = ObservationData;

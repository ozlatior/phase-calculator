/*
 * Application Environment Class
 */

const path = require("path");
const fs = require("fs");

const timeUtil = require("./time.js");

const Phases = require("./phases.js");
const TimeOne = require("./time-one.js");
const ObservationData = require("./observation-data.js");

class Environment {

	constructor (config) {
		this.objectsPath = config.objectsPath;
		this.dataPath = config.dataPath;
		this.objects = null;
		this.observations = null;
		this.phases = null;
		this.outputFn = (output) => output;
		this.maxPastStr = config.defaults.maxPast;
		this.maxFutureStr = config.defaults.maxFuture;
		this.maxPast = timeUtil.literalToTime(config.defaults.maxPast);
		this.maxFuture = timeUtil.literalToTime(config.defaults.maxFuture);
		this.defaults = config.defaults;
	}

	setOutputFunction (fn) {
		this.outputFn = fn;
	}

	loadObjects () {
		this.objects = {};
		this.phases = {};
		this.observations = {};
		let files = fs.readdirSync(this.objectsPath);
		for (let i=0; i<files.length; i++) {
			if (files[i].match(/^.*\.js(on)?$/g) === null)
				continue;
			let object = fs.readFileSync(path.join(this.objectsPath, files[i])).toString();
			object = JSON.parse(object);
			if (!object.name)
				object.name = files[i].replace(/\.js[on]?$/, "");;
			object.filename = files[i];
			this.objects[object.name.toLowerCase()] = object;
			this.phases[object.name.toLowerCase()] = this.createPhasesObject(object);
		}
		files = fs.readdirSync(this.dataPath);
		for (let i=0; i<files.length; i++) {
			let dataStr = fs.readFileSync(path.join(this.dataPath, files[i])).toString();
			let data = JSON.parse(dataStr);
			data.filename = files[i];
			let object = data.objectData.name.toLowerCase();
			this.observations[object] = new ObservationData(this.phases[object]);
			this.observations[object].parseString(dataStr);
		}
		// create observation data where file not found
		for (let i in this.phases)
			if (this.observations[i] === undefined)
				this.observations[i] = new ObservationData(this.phases[i]);
	}

	createPhasesObject (o) {
		let object = JSON.parse(JSON.stringify(o));
		let timezone = object.timezone;
		if (timezone === "local")
			timezone = null;
		else if (timezone === "utc")
			timezone = 0;
		else
			timezone = parseInt(timezone);
		let t = new TimeOne(timezone);
		t.setLocalStatic(object.tzero);
		t.setMilliseconds(0);
		object.tzero = t.getUnixTime();
		// store timeone object in initial object
		o.tzero = t;
		return new Phases(object);
	}

	countChildren (p) {
		let ret = 0;
		for (let i in p.objects)
			ret++;
		return ret;
	}

	listObjectNames () {
		let ret = [];
		for (let i in this.objects)
			ret.push(i);
		return ret;
	}

	listChildren (p) {
		let ret = [];
		for (let i in p.objects)
			ret.push(i);
		return ret;
	}

	listObjects () {
		if (!this.objects)
			this.loadObjects();
		let ret = {
			before: [ "Listing all objects at path " + this.objectsPath ],
			after: [ "Use info command to get more information about a single object" ],
			header: [ "Parent", "Objects", "Steps", "Visible" ],
			data: []
		};
		for (let i in this.objects) {
			ret.data.push([ this.objects[i].name, this.countChildren(this.objects[i]),
				this.objects[i].steps, this.objects[i].visible.join(" - ") ]);
		}
		return this.outputFn(ret);
	}

	getObjectInfo (object) {
		if (!this.objects)
			this.loadObjects();
		object = object.toLowerCase();
		if (!this.objects[object])
			return this.outputFn([ "No such object " + object, "Available objects: " + this.listObjectNames().join(", ") ]);
		let ret = {
			before: [ "Object info for parent object " + object ],
			after: [ "Use the phase command to get more information about object phases" ],
			header: [ "Property", "Value", "Details" ],
			data: []
		};
		let o = this.objects[object];
		let p = this.phases[object];
		ret.data = [
			[ "Name",		o.name,								"Name given in the configuration file" ],
			[ "Children",	this.countChildren(o),				"Number of tracked children for this object" ],
			[ " - names",	this.listChildren(o).join(", "),	"Names of tracked children for this object" ],
			[ "Reference",	o.reference,						"Reference cycle child name" ],
			[ "Timezone",	o.timezone,							"Timezone as specified in the configuration file" ],
			[ " - name",	o.tzero.getTimezoneName(),			"Timezone as translated by TimeOne object" ],
			[ "Local T0",	o.tzero.toTimeString(),				"Start of tracking as local time" ],
			[ "  UTC T0",	o.tzero.toTimeString(true),			"Start of tracking as UTC time" ],
			[ "Visible",	o.visible.join(" - "),				"Visibility interval" ]
		];
		return this.outputFn(ret);
	}

	phasesInfoRow (property, value, details) {
		let ret = [ property, value ];
		value /= 1000 * 60;
		ret.push(Math.round(value * 1000) / 1000);
		value /= 60;
		ret.push(Math.round(value * 1000) / 1000);
		value /= 24;
		ret.push(Math.round(value * 1000) / 1000);
		ret.push(details);
		return ret;
	}

	childrenInfoRow (property, values, details, order) {
		let ret = [ property ];
		for (let i=0; i<order.length; i++)
			ret.push(Math.round(values[order[i]] * 1000) / 1000);
		ret.push(details);
		return ret;
	}

	getPhasesInfo (object) {
		if (!this.objects)
			this.loadObjects();
		object = object.toLowerCase();
		if (!this.objects[object])
			return this.outputFn([ "No such object " + object, "Available objects: " + this.listObjectNames().join(", ") ]);
		let t1 = {
			before: [ "Phases info for parent object " + object ],
			after: [],
			header: [ "Property", "Value", "Minutes", "Hours", "Days", "Details" ],
			data: []
		};
		let p = this.phases[object];
		t1.data = [
			[ "TZero",				p.getTZero(), "", "", "",			"Start of tracking as milliseconds time" ],
			this.phasesInfoRow("Total Interval", p.getTotalInterval() * 60 * 1000,
				"Total time interval for a full phase rotation"),
			this.phasesInfoRow("Reference Interval", p.getReferenceInterval() * 60 * 1000,
				"Time interval of the reference cycle (" + p.getReferenceObject() + ")" ),
			this.phasesInfoRow("Step Interval", p.getStepInterval() * 60 * 1000,
				"Step interval based on the reference cycle (" + p.getReferenceObject() + ")" ),
			[ "Reference Steps",	p.getReferenceSteps(), "", "", "",	"Number of steps for a reference cycle" ],
			[ "Total Steps",		p.getTotalStepCount(), "", "", "",  "Total number of steps for a full phase rotation" ],
			[ "Total Cycles",		p.getTotalCycleCount(), "", "", "", "Total number of cycles of the reference object" ]
		];
		let t2 = {
			before: [ "Phases info for children of parent object " + object ],
			after: [ "Use the phase and observation commands to get more information about object phases" ],
			header: [ "Property" ],
			data: []
		};
		let children = p.getObjectNames();
		t2.header = t2.header.concat(children);
		t2.header.push("Details");
		t2.data = [
			this.childrenInfoRow("Period (minutes)", p.getPeriods(), "Total phase periods in minutes", children),
			this.childrenInfoRow("Period (hours)", p.getPeriods(60), "Total phase periods in hours", children),
			this.childrenInfoRow("Period (days)", p.getPeriods(60 * 24), "Total phase periods in days", children),
			this.childrenInfoRow("Phase multiplier", p.getPhaseMultipliers(), "Ratio to reference phase", children)
		];
		this.outputFn(t1);
		this.outputFn(t2);
		return [ t1, t2 ];
	}

	// check if time is between start and end hours
	// if time is between S and E, next(E) < next(S) :
	//    S .. T .. E .. .. .. S
	// otherwise, next(E) > next(S) :
	//    T .. .. .. S .. E
	isTimeBetween (time, start, end) {
		let reference = new TimeOne(time);
		// set reference to next start and end time so we can compare
		reference.setNext("HH:mm", start, { sharp: true });
		start = reference.getUnixTime();
		// set back to start time so we can check the end time
		reference.setUnixTime(time.getUnixTime());
		reference.setNext("HH:mm", end, { sharp: true });
		end = reference.getUnixTime();
		return end < start;
	}

	getPhasesList (object, args) {
		if (!this.objects)
			this.loadObjects();
		object = object.toLowerCase();
		if (!this.objects[object])
			return this.outputFn([ "No such object " + object, "Available objects: " + this.listObjectNames().join(", ") ]);

		let o = this.objects[object];
		let p = this.phases[object];
		let index = 0;
		if (args.index)
			index = parseInt(args.index);
		let count = p.getTotalStepCount();
		if (args.count)
			count = parseInt(args.count);
		let date = (new Date()).getTime();
		if (args.date)
			date = TimeOne.fromString(args.date, o.tzero.getTimezoneOffset()).getUnixTime();
		let clock = new TimeOne(o.tzero.getTimezoneOffset());
		clock.stop();
		clock.setUnixTime(date);

		let ret = {
			before: [ "Phases list for object " + object + ". Showing " + count + " phases from index " + index,
				"Reference local time is " + clock.toTimeString() ],
			after: [ "Use the phase and observation commands to get more information about object phases" ],
			header: [ "Index", "Last", "i", "Next", "i", "Last Visible", "i", "Next Visible", "i" ],
			data: []
		};
		let children = p.getObjectNames();
		ret.header = ret.header.concat(children);

		let maxCyclesPast = Math.floor(this.maxPast / (p.getTotalInterval() * TimeOne.MINUTE));
		let maxCyclesFuture = Math.floor(this.maxFuture / (p.getTotalInterval() * TimeOne.MINUTE))

		for (let i=index; i<index+count; i++) {
			let row = [ i ];

			// last and next tiems
			clock = new TimeOne(o.tzero.getTimezoneOffset());
			let time;
			let cycles;
			clock.stop();

			// find first occurence of the step in the past
			time = p.getPreviousTime(i, date);
			clock.setUnixTime(time);
			row.push(clock.toTimeString());
			row.push(p.getPreviousStep(time));

			// go back until we find a visible interval
			cycles = 0;
			while (!this.isTimeBetween(clock, o.visible[0], o.visible[1])) {
				cycles++;
				if (cycles > maxCyclesPast)
					break;
				clock.setBack(p.getTotalInterval() * TimeOne.MINUTE);
			}
			let prevTime = clock.toTimeString();
			let prevIndex = p.getPreviousStep(clock.getUnixTime());
			if (cycles > maxCyclesPast) {
				prevTime = "> " + this.maxPastStr;
				prevIndex = "-";
			}

			// find first occurence of the step in the future
			time = p.getNextTime(i, date);
			clock.setUnixTime(time);
			row.push(clock.toTimeString());
			row.push(p.getNextStep(time));

			// go forward until we find a visible interval
			cycles = 0;
			while (!this.isTimeBetween(clock, o.visible[0], o.visible[1])) {
				cycles++;
				if (cycles > maxCyclesFuture)
					break;
				clock.setForward(p.getTotalInterval() * TimeOne.MINUTE);
			}
			let nextTime = clock.toTimeString();
			let nextIndex = p.getNextStep(clock.getUnixTime());
			if (cycles > maxCyclesFuture) {
				nextTime = "> " + this.maxFutureStr;
				nextIndex = "-";
			}

			row.push(prevTime);
			row.push(prevIndex);
			row.push(nextTime);
			row.push(nextIndex);

			// finally, calculate the phases of all children for current step
			let phases = p.getPhases(i);
			for (let j=0; j<children.length; j++)
				row.push(Math.round(phases[children[j]] * 1000) / 1000);

			ret.data.push(row);
		}
		return this.outputFn(ret);
	}

	getNextPhases (object, args) {
		if (!this.objects)
			this.loadObjects();
		object = object.toLowerCase();
		if (!this.objects[object])
			return this.outputFn([ "No such object " + object, "Available objects: " + this.listObjectNames().join(", ") ]);

		let o = this.objects[object];
		let p = this.phases[object];
		let count = this.defaults.itemCount;
		if (args.count)
			count = parseInt(args.count);
		let date = (new Date()).getTime();
		if (args.date)
			date = TimeOne.fromString(args.date, o.tzero.getTimezoneOffset()).getUnixTime();

		let clock = TimeOne.fromUnixTime(date, o.tzero.getTimezoneOffset());
		let ret = {
			before: [ "Phases list for object " + object + ". Showing " + count + " phases from date " + clock.toTimeString() ],
			after: [ "Use the phase and observation commands to get more information about object phases" ],
			header: [ "Index", "Count", "Time", "Visible" ],
			data: []
		};
		let children = p.getObjectNames();
		ret.header = ret.header.concat(children);

		let nextStep = p.getNextStep(date);
		for (let i=nextStep; i<nextStep+count; i++) {
			let row = [ i, i % p.getTotalStepCount() ];

			// get corresponding time and visibility
			clock.setUnixTime(p.getStepTime(i));
			row.push(clock.toTimeString());
			row.push(this.isTimeBetween(clock, o.visible[0], o.visible[1]));

			// finally, calculate the phases of all children for current step
			let phases = p.getPhases(i);
			for (let j=0; j<children.length; j++)
				row.push(Math.round(phases[children[j]] * 1000) / 1000);

			ret.data.push(row);
		}

		return this.outputFn(ret);
	}

	getPreviousPhases (object, args) {
		if (!this.objects)
			this.loadObjects();
		object = object.toLowerCase();
		if (!this.objects[object])
			return this.outputFn([ "No such object " + object, "Available objects: " + this.listObjectNames().join(", ") ]);

		let o = this.objects[object];
		let p = this.phases[object];
		let count = this.defaults.itemCount;
		if (args.count)
			count = parseInt(args.count);
		let date = (new Date()).getTime();
		if (args.date)
			date = TimeOne.fromString(args.date, o.tzero.getTimezoneOffset()).getUnixTime();

		let clock = TimeOne.fromUnixTime(date, o.tzero.getTimezoneOffset());
		let ret = {
			before: [ "Phases list for object " + object + ". Showing " + count + " phases to date " + clock.toTimeString() ],
			after: [ "Use the phase and observation commands to get more information about object phases" ],
			header: [ "Index", "Count", "Time", "Visible" ],
			data: []
		};
		let children = p.getObjectNames();
		ret.header = ret.header.concat(children);

		let nextStep = p.getPreviousStep(date);
		for (let i=nextStep; i>nextStep-count; i--) {
			let row = [ i, i % p.getTotalStepCount() ];

			// get corresponding time and visibility
			clock.setUnixTime(p.getStepTime(i));
			row.push(clock.toTimeString());
			row.push(this.isTimeBetween(clock, o.visible[0], o.visible[1]));

			// finally, calculate the phases of all children for current step
			let phases = p.getPhases(i);
			for (let j=0; j<children.length; j++)
				row.push(Math.round(phases[children[j]] * 1000) / 1000);

			ret.data.unshift(row);
		}

		return this.outputFn(ret);
	}

	getCurrentPhase (object, args) {
		if (!this.objects)
			this.loadObjects();
		object = object.toLowerCase();
		if (!this.objects[object])
			return this.outputFn([ "No such object " + object, "Available objects: " + this.listObjectNames().join(", ") ]);
		let p = this.phases[object];
		let ret = {
			before: [ "Phases info for children of parent object " + object ],
			after: [ "Use the phase and observation commands to get more information about object phases" ],
			header: [ "Property" ],
			data: []
		};
	}

	observationTimeStrings (p, o) {
		let ret = {};
		let clock = new TimeOne(p.tzero);
		clock.setUnixTime(o.time);
		ret.time = clock.toTimeString();
		clock.setUnixTime(o.timeAdded);
		ret.timeAdded = clock.toTimeString();
		clock.setUnixTime(o.timeUpdated);
		ret.timeUpdated = clock.toTimeString();
		return ret;
	}

	toBoolean (value) {
		if (typeof(value) === "string")
			value = value.toLowerCase();
		switch (value) {
			case "yes":
			case "true":
			case "y":
			case "t":
			case "1":
				return true;
			case "no":
			case "false":
			case "n":
			case "f":
			case "0":
				return false;
		}
		return !!value;
	}

	getObservations (object, args) {
		if (!this.objects)
			this.loadObjects();
		object = object.toLowerCase();
		if (!this.objects[object])
			return this.outputFn([ "No such object " + object, "Available objects: " + this.listObjectNames().join(", ") ]);

		let o = this.objects[object];
		let p = this.phases[object];
		let d = this.observations[object];
		let index = 0;
		if (args.index)
			index = parseInt(args.index);
		let count = this.defaults.itemCount;
		if (args.count)
			count = parseInt(args.count);
		let missing;
		if (args.missing)
			missing = this.toBoolean(args.missing);

		let ret = {
			before: [ "Observation list for object " + object + ". Showing " + count + " phases from index " + index ],
			after: [ "Use the phase and observation commands to get more information about object phases" ],
			header: [ "Phase", "Observation", "Date", "Date added", "Date updated", "Details" ],
			data: []
		};

		if (missing === true)
			ret.before.push("Showing only phases without any recorded observation");
		if (missing === false)
			ret.before.push("Showing only phases with recorded observations");

		for (let i=index; i<index+count; i++) {
			if (missing === true && d.observations[i].length !== 0)
				continue;
			if (missing === false && d.observations[i].length === 0)
				continue;

			if (d.observations[i].length === 0)
				ret.data.push([ i, "-", "-", "-", "-", "No observations have been recorded for this phase step" ]);
			else {
				let data = d.observations[i];
				for (let j=0; j<data.length; j++) {
					let row = [];
					row.push(j === 0 ? i : "");
					row.push(j+1);
					let times = this.observationTimeStrings(o, data[j]);
					row = row.concat([ times.time, times.timeAdded, times.timeUpdated ]);
					row.push(data[j].details);
					ret.data.push(row);
				}
			}
		}
		return this.outputFn(ret);
	}

	observationList (object, from, to, missing) {
		let o = this.objects[object];
		let p = this.phases[object];
		let d = this.observations[object];
		let steps = p.getIntervalSteps(from, to, true);
		let ret = [];
		for (let i=0; i<steps.length; i++) {
			let data = d.getObservations(steps[i]);
			if (missing === true && data.length > 0)
				continue;
			if (missing === false && data.length === 0)
				continue;

			if (data.length === 0) {
				let clock = new TimeOne(o.tzero.getTimezoneOffset());
				clock.stop();
				clock.setUnixTime(p.getStepTime(steps[i]));
				ret.push(
					[ steps[i], "-", clock.toTimeString(), "-", "-", "No observations have been recorded for this phase step" ]
				);
			}
			else {
				for (let j=0; j<data.length; j++) {
					let row = [];
					row.push(j === 0 ? steps[i] : "");
					row.push(j+1);
					let times = this.observationTimeStrings(o, data[j]);
					row = row.concat([ times.time, times.timeAdded, times.timeUpdated ]);
					row.push(data[j].details);
					ret.push(row);
				}
			}
		}
		return ret;
	}

	getCurrentObservations (object, args) {
		if (!this.objects)
			this.loadObjects();
		object = object.toLowerCase();
		if (!this.objects[object])
			return this.outputFn([ "No such object " + object, "Available objects: " + this.listObjectNames().join(", ") ]);

		let o = this.objects[object];
		let p = this.phases[object];
		let d = this.observations[object];
		let date = (new Date()).getTime();
		if (args.date)
			date = TimeOne.fromString(args.date, o.tzero.getTimezoneOffset()).getUnixTime();
		let missing;
		if (args.missing)
			missing = this.toBoolean(args.missing);

		let clock = new TimeOne(o.tzero);
		clock.stop();
		clock.setUnixTime(date);

		let ret = {
			before: [ "Visible observations for object " + object + ". Showing current phases for " + clock.toTimeString() ],
			after: [ "Use the phase and observation commands to get more information about object phases" ],
			header: [ "Phase", "Observation", "Date", "Date added", "Date updated", "Details" ],
			data: []
		};

		if (missing === true)
			ret.before.push("Showing only phases without any recorded observation");
		if (missing === false)
			ret.before.push("Showing only phases with recorded observations");

		let inInterval = this.isTimeBetween(clock, o.visible[0], o.visible[1]);
		if (!inInterval) {
			delete ret.header;
			delete ret.data;
			ret.before.push("Currently selected interval is not in the visibility interval for " +
				object + " (" + o.visible.join(" - ") + ")");
			return this.outputFn(ret);
		}

		// use the clock to get interval time
		clock.setPrevious("HH:mm", o.visible[0], { sharp: true });
		let prev = clock.getUnixTime();
		clock.setNext("HH:mm", o.visible[1], { sharp: true });
		let next = clock.getUnixTime();

		let list = this.observationList(object, prev, next, missing);

		if (list.length === 0) {
			delete ret.header;
			delete ret.data;
			ret.before.push("No observations for selected 'missing' value for " + object);
			return this.outputFn(ret);
		}

		ret.data = list;

		return this.outputFn(ret);
	}

	getNextObservations (object, args) {
		if (!this.objects)
			this.loadObjects();
		object = object.toLowerCase();
		if (!this.objects[object])
			return this.outputFn([ "No such object " + object, "Available objects: " + this.listObjectNames().join(", ") ]);

		let o = this.objects[object];
		let p = this.phases[object];
		let d = this.observations[object];
		let date = (new Date()).getTime();
		if (args.date)
			date = TimeOne.fromString(args.date, o.tzero.getTimezoneOffset()).getUnixTime();
		let missing;
		if (args.missing)
			missing = this.toBoolean(args.missing);
		let count = 1;
		if (args.count)
			count = parseInt(args.count);

		let clock = new TimeOne(o.tzero);
		clock.stop();
		clock.setUnixTime(date);

		let ret = {
			before: [ "Visible observations for object " + object + ". Showing next phases for " + clock.toTimeString() ],
			after: [ "Use the phase and observation commands to get more information about object phases" ],
			header: [ "Phase", "Observation", "Date", "Date added", "Date updated", "Details" ],
			data: []
		};

		if (missing === true)
			ret.before.push("Showing only phases without any recorded observation");
		if (missing === false)
			ret.before.push("Showing only phases with recorded observations");

		if (count > 1)
			ret.before.push("Showing observations for the following " + count + " days");

		let inInterval = this.isTimeBetween(clock, o.visible[0], o.visible[1]);
		// if we are in an interval display a message about it and jump to end of interval
		if (inInterval) {
			ret.before.push("");
			ret.before.push(
				"Selecte date and time are in the visilibity interval. However, those observations will not be displayed");
			ret.before.push("Use --current to display observations from the active visibility interval");
			// set clock to the end of interval + 1 minute so we can jump to the next
			clock.setNext("HH:mm", o.visible[1], { sharp: true });
		}

		for (let i=0; i<count; i++) {
			// use the clock to get interval time
			clock.setNext("HH:mm", o.visible[0], { sharp: true });
			let prev = clock.getUnixTime();
			let prevStr = clock.toTimeString();
			clock.setNext("HH:mm", o.visible[1], { sharp: true });
			let next = clock.getUnixTime();
			let nextStr = clock.toTimeString();

			let list = this.observationList(object, prev, next, missing);

			if (list.length === 0 && count === 1) {
				delete ret.header;
				delete ret.data;
				ret.before.push("No observations for selected 'missing' value for " + object);
				return this.outputFn(ret);
			}

			ret.data.push([ "###", "###", "Interval " + (i + 1), "###", "###",
				"Observations between " + prevStr + " and " + nextStr ]);
			if (list.length === 0)
				ret.data.push([ "-", "-", "-", "-", "-", "No observations for selected 'missing' value" ]);
			else
				ret.data = ret.data.concat(list);
		}

		return this.outputFn(ret);
	}

	getPreviousObservations (object, args) {
		if (!this.objects)
			this.loadObjects();
		object = object.toLowerCase();
		if (!this.objects[object])
			return this.outputFn([ "No such object " + object, "Available objects: " + this.listObjectNames().join(", ") ]);

		let o = this.objects[object];
		let p = this.phases[object];
		let d = this.observations[object];
		let date = (new Date()).getTime();
		if (args.date)
			date = TimeOne.fromString(args.date, o.tzero.getTimezoneOffset()).getUnixTime();
		let missing;
		if (args.missing)
			missing = this.toBoolean(args.missing);
		let count = 1;
		if (args.count)
			count = parseInt(args.count);

		let clock = new TimeOne(o.tzero);
		clock.stop();
		clock.setUnixTime(date);

		let ret = {
			before: [ "Visible observations for object " + object + ". Showing previous phases for " + clock.toTimeString() ],
			after: [ "Use the phase and observation commands to get more information about object phases" ],
			header: [ "Phase", "Observation", "Date", "Date added", "Date updated", "Details" ],
			data: []
		};

		if (missing === true)
			ret.before.push("Showing only phases without any recorded observation");
		if (missing === false)
			ret.before.push("Showing only phases with recorded observations");

		if (count > 1)
			ret.before.push("Showing observations for the previous " + count + " days");

		let inInterval = this.isTimeBetween(clock, o.visible[0], o.visible[1]);
		// if we are in an interval display a message about it and jump to end of interval
		if (inInterval) {
			ret.before.push("");
			ret.before.push(
				"Selecte date and time are in the visilibity interval. However, those observations will not be displayed");
			ret.before.push("Use --current to display observations from the active visibility interval");
			// set clock to the start of interval so we can jump to the next
			clock.setPrevious("HH:mm", o.visible[0], { sharp: true });
		}

		for (let i=0; i<count; i++) {
			// use the clock to get interval time
			clock.setPrevious("HH:mm", o.visible[1], { sharp: true });
			let next = clock.getUnixTime();
			let nextStr = clock.toTimeString();
			clock.setPrevious("HH:mm", o.visible[0], { sharp: true });
			let prev = clock.getUnixTime();
			let prevStr = clock.toTimeString();

			let list = this.observationList(object, prev, next, missing);

			if (list.length === 0 && count === 1) {
				delete ret.header;
				delete ret.data;
				ret.before.push("No observations for selected 'missing' value for " + object);
				return this.outputFn(ret);
			}

			ret.data.push([ "###", "###", "Interval " + (i + 1), "###", "###",
				"Observations between " + prevStr + " and " + nextStr ]);
			if (list.length === 0)
				ret.data.push([ "-", "-", "-", "-", "-", "No observations for selected 'missing' value" ]);
			else
				ret.data = ret.data.concat(list);
		}

		return this.outputFn(ret);
	}

	/*
		"observation": {
			alias: [ "observations", "o" ],
			description: "Get or set observation information",
			valueArgs: {
				"object": { alias: [ "o" ], equal: "=" },
				"list" : { alias: [ "i" ] },
				"next": { alias: [ "n" ] },
				"previous": { alias: [ "p" ] },
				"add": { alias: [ "a" ] },
				"remove": { alias: [ "r" ] },
				"current": { alias: [ "c" ] },
				"all": {},
				"index": { alias: [ "i" ], equal: "=" },
				"date": { alias: [ "d" ], equal: "=" },
				"from": { alias: [ "f" ], equal: "=" },
				"to": { alias: [ "t" ], equal: "=" },
				"count": { alias: [ "t" ], equal: "=" }
			},
			help: [
				"observation <action> --object=<object> --date=<date> <list>",
				"Actions: list, next, previous, index, add, remove",
				"--count= to set number of phase steps to display",
				"--date=, --from=, --to= to set the date or use the argument --current",
				"for --remove, use --index=<phase> to unset observations from a specific index or --all to unset indices completely",
				"<list> is a list of numbers (indices) corresponding to the phase in the table"
			]
		}
	*/

	addObservations (object, args) {
		if (!this.objects)
			this.loadObjects();
		object = object.toLowerCase();
		if (!this.objects[object])
			return this.outputFn([ "No such object " + object, "Available objects: " + this.listObjectNames().join(", ") ]);
		let step = parseInt(args.step);
		let date = (new Date()).getTime();
		if (args.date)
			date = TimeOne.fromString(args.date, o.tzero.getTimezoneOffset()).getUnixTime();
		let message = "";
		if (args.message)
			message = args.message;

		let o = this.objects[object];
		let p = this.phases[object];
		let d = this.observations[object];

		let filePath = path.join(this.dataPath, o.filename);
		let clock = new TimeOne(o.tzero);
		clock.setUnixTime(date);
		let stepTime = p.getNearestTime(step, date);

		let res = d.addObservation(step, stepTime, message);

		let ret = {
			before: [ "Added observation for " + object + ", phase step " + step + ", for time " + clock.toTimeString() ],
			after: [ "Update observations have been saved to file " + filePath ],
			header: [ "Phase", "Observation", "Date", "Date added", "Date updated", "Details" ],
			data: []
		};

		for (let i=0; i<res.length; i++) {
			let dates = this.observationTimeStrings(o, res[i]);
			ret.data.push([ step, i+1, dates.time, dates.timeAdded, dates.timeUpdated, res[i].details ]);
		}

		fs.writeFileSync(filePath, d.serialize() + "\n");

		return this.outputFn(ret);
	}

	removeObservations (object, args) {
		if (!this.objects)
			this.loadObjects();
		object = object.toLowerCase();
		if (!this.objects[object])
			return this.outputFn([ "No such object " + object, "Available objects: " + this.listObjectNames().join(", ") ]);
		let step = parseInt(args.step);
		let index;
		if (args.index)
			index = parseInt(args.index);
		if (args.all)
			index = "all";
		if (index === undefined)
			return this.outputFn([ "You must either specify an index (--index) or use the --all argument" ]);

		let o = this.objects[object];
		let d = this.observations[object];
		let filePath = path.join(this.dataPath, o.filename);

		if (step < 0 || step > d.getStepCount())
			return this.outputFn([ "Step/phase out of range. Use a number between 0 and " + d.getStepCount() ]);

		let res = [];
		let ret = {
			before: [],
			after: [ "Update observations have been saved to file " + filePath ],
			header: [ "Phase", "Observation", "Date", "Date added", "Date updated", "Details" ],
			data: []
		};

		if (index === "all") {
			res = d.removeAllObservations(step);
			ret.before.push("Removed all observations for step " + step);
		}
		else {
			res = d.removeObservation(step, index-1);
			ret.before.push("Removed observation " + index + " for step " + step);
		}

		if (res.length === 0)
			ret.data.push([ "-", "-", "-", "-", "-", "No observation records left for this step" ]);
		else {
			for (let i=0; i<res.length; i++) {
				let dates = this.observationTimeStrings(o, res[i]);
				ret.data.push([ step, i+1, dates.time, dates.timeAdded, dates.timeUpdated, res[i].details ]);
			}
		}

		fs.writeFileSync(filePath, d.serialize() + "\n");

		return this.outputFn(ret);
	}

}

module.exports = Environment;

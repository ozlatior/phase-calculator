const output = function(out) {
	console.log("\n" + out.join("\n") + "\n");
	return out;
};

// return missing arguments from list
const checkRequired = function(args, required) {
	let ret = [];
	for (let i=0; i<required.length; i++)
		if (args[required[i]] === undefined)
			ret.push(required[i]);
	return ret;
};

// return extra arguments from object
const checkExtra = function(args, allowed) {
	let ret = [];
	for (let i in args) {
		if (i.indexOf("__") === 0)
			continue;
		if (allowed.indexOf(i) === -1)
			ret.push(i);
	}
	return ret;
};

// return values that don't match from array
const checkMatching = function(args, allowed) {
	let ret = [];
	for (let i=0; i<args.length; i++) {
		let matches = false;
		for (let j=0; j<allowed.length; j++) {
			if (args[i].match(new RegExp("^" + allowed[j] + "$")) !== null) {
				matches = true;
				break;
			}
		}
		if (!matches)
			ret.push(args[i]);
	}
	return ret;
};

// check missing arguments and change output accordingly, return true if anything is missing
const outputRequired = function(args, requiredList, out) {
	let required = checkRequired(args, requiredList);
	if (required && required.length) {
		out.push("Missing required arguments: " + required.join(","));
		return true;
	}
	return false;
};

// check extra arguments and change output accordingly, return true if anything is extra
const outputExtra = function(args, allowedList, out) {
	let extra = checkExtra(args, allowedList);
	if (extra && extra.length) {
		out.push("Unknown arguments for this command: " + extra.join(", "));
		return true;
	}
	return false;
};

// check extra arguments and change output accordingly, return true if anything is extra
const outputUnmatching = function(args, min, max, allowedList, out) {
	if (args.length < min) {
		out.push("At least list " + min + " arguments required for this command. Found: " + args.join(", "));
		return true;
	}
	if (args.length > max) {
		out.push("At most list " + max + " arguments allowed for this command. Found: " + args.join(", "));
		return true;
	}
	let extra = checkMatching(args, allowedList);
	if (extra && extra.length) {
		out.push("List arguments not allowed for this command: " + extra.join(", "));
		return true;
	}
	return false;
};

const handlers = {

	"list": function (args) {
		let out = [];
		if (!args.itemType) {
			out.push("Usage: list <itemType>");
			out.push("The following item types are currently available: objects");
			output(out);
			return out;
		}
		switch (args.itemType) {
			case "objects":
				out = this.listObjects();
				return out;
			default:
				out.push("List: no such item type " + args.itemType);
				out.push("The following item types are currently available: objects");
				output(out);
				return out;
		}
	},

	"info": function (args) {
		let out = [];
		if (args.object) {
			out = this.getObjectInfo(args.object);
			return out;
		}
		out.push("Info: must specify an item. Currently available: --object");
		output(out);
		return out;
	},

	"phase": function (args) {
		let out = [];
		if (outputRequired(args, [ "object" ], out))
			return output(out);
		// command args
		if (args.info) {
			if (outputExtra(args, [ "object", "info" ], out) || outputUnmatching(args.__listArgs, 0, 0, [], out))
				return output(out);
			out = this.getPhasesInfo(args.object);
			return out;
		}
		if (args.list) {
			if (outputExtra(args, [ "object", "list", "index", "count" ], out)
				|| outputUnmatching(args.__listArgs, 0, 0, [], out))
					return output(out);
			out = this.getPhasesList(args.object, args);
			return out;
		}
		if (args.next) {
			if (outputExtra(args, [ "object", "next", "date", "count" ], out)
					|| outputUnmatching(args.__listArgs, 0, 0, [], out))
				return output(out);
			out = this.getNextPhases(args.object, args);
			return out;
		}
		if (args.previous) {
			if (outputExtra(args, [ "object", "previous", "date", "count" ], out)
					|| outputUnmatching(args.__listArgs, 0, 0, [], out))
				return output(out);
			out = this.getPreviousPhases(args.object, args);
			return out;
		}
		if (args.current) {
			if (outputExtra(args, [ "object", "current", "date" ], out) || outputUnmatching(args.__listArgs, 0, 0, [], out))
				return output(out);
			out = this.getCurrentPhase(args.object, args);
			return out;
		}
		out.push("Phase: no action specified. Pick one: --info, --next, --previous, --current");
		output(out);
		return out;
	},

	"observation": function (args) {
		let out = [];
		// command args
		if (args.list) {
			if (outputExtra(args, [ "object", "list", "count", "index", "missing" ], out) ||
				outputUnmatching(args.__listArgs, 0, 0, [], out))
					return output(out);
			out = this.getObservations(args.object, args);
			return out;
		}
		if (args.current) {
			if (outputExtra(args, [ "object", "current", "date", "missing" ], out) ||
				outputUnmatching(args.__listArgs, 0, 0, [], out))
					return output(out);
			out = this.getCurrentObservations(args.object, args);
			return out;
		}
		if (args.next) {
			if (outputExtra(args, [ "object", "next", "date", "count", "missing" ], out) ||
				outputUnmatching(args.__listArgs, 0, 0, [], out))
					return output(out);
			out = this.getNextObservations(args.object, args);
			return out;
		}
		if (args.previous) {
			if (outputExtra(args, [ "object", "previous", "date", "count", "missing" ], out) ||
				outputUnmatching(args.__listArgs, 0, 0, [], out))
					return output(out);
			out = this.getPreviousObservations(args.object, args);
			return out;
		}
		if (args.add) {
			if (outputExtra(args, [ "object", "add", "step", "date", "message" ], out) ||
				outputRequired(args, [ "step" ], out) ||
				outputUnmatching(args.__listArgs, 0, 1e10, [ "[0-9]+" ], out))
					return output(out);
			out = this.addObservations(args.object, args);
			return out;
		}
		if (args.remove) {
			if (outputExtra(args, [ "object", "remove", "step", "all", "index" ], out) ||
				outputRequired(args, [ "step" ], out) ||
				outputUnmatching(args.__listArgs, 0, 1e10, [ "[0-9]+" ], out))
					return output(out);
			out = this.removeObservations(args.object, args);
			return out;
		}
		out.push("Observation: no action specified. Pick one: --list, --next, --previous, --index, --add, --remove");
		output(out);
		return out;
	}

};

const register = function (cmd, env) {
	for (let i in handlers)
		cmd.setHandler(i, handlers[i].bind(env));
};

module.exports.handlers = handlers;
module.exports.register = register;

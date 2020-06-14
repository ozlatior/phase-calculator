const model = {

	name: "unix",

	error: function (str) {
		return {
			error: str
		}
	},

	parseArg: function (arg, cmd) {
		let args = cmd.modelData.argRegexp;
		let name = null;
		for (let i in args) {
			if (arg.match(args[i]) !== null) {
				name = i;
				break;
			}
		}
		let ret = {
			name: name
		};
		if (name === null)
			return ret;
		if (cmd.valueArgs[name].equal && cmd.valueArgs[name].equal !== " ") {
			let value = arg.split(cmd.valueArgs[name].equal);
			value.shift();
			ret.value = value.join(cmd.valueArgs[name].equal);
		}
		else if (cmd.valueArgs[name].equal === " ")
			ret.value = null;
		else
			ret.value = true;
		return ret;
	},

	// assume first word is command, the rest are arguments
	// if they are preceded by a - or --, they are named (value) arguments
	// otherwise they are list arguments
	parseArgs: function (args, cmdOne) {
		if (!args.length)
			return model.error("Command word missing");

		let cmdName = args[0];
		let cmd = cmdOne.getCommandByAlias(cmdName);
		if (!cmd)
			return model.error("Command not found " + cmdName);

		args = args.slice(1);
		if (cmd.argCount && args.length < cmd.argCount)
			return model.error("Command requires at least " + cmd.argCount + " arguments");

		let ret = {
			cmdName: cmd.name,
			cmdAlias: cmdName,
			args: { }
		};

		let listArgs = [];
		ret.args.__listArgs = listArgs;

		for (let i=0; i<args.length; i++) {
			let arg = model.parseArg(args[i], cmd);
			if (arg.name)
				ret.args[arg.name] = arg.value;
			else
				listArgs.push(args[i]);
		}
		if (cmd.listArgs) {
			for (let i=0; i<listArgs.length; i++) {
				ret.args[cmd.listArgs[i]] = listArgs[i];
			}
		}

		return ret;
	},

	getArgRegexp: function (name, arg) {
		let names = [ name ];
		if (arg.alias)
			names = names.concat(arg.alias);
		names = names.map((item) => item.length === 1 ? "-" + item : "--" + item);
		let ret = "(" + names.join("|") + ")";
		if (arg.equal && arg.equal !== " ")
			ret += arg.equal + ".*";
		ret = new RegExp("^" + ret + "$", "g");
		return ret;
	},

	prepareCommand: function (cmd) {
		if (cmd.modelData && cmd.modelData.modelName === model.name)
			return;
		cmd.modelData = {};
		cmd.modelData.argRegexp = {};
		for (let i in cmd.valueArgs)
			cmd.modelData.argRegexp[i] = model.getArgRegexp(i, cmd.valueArgs[i]);
	}

};

module.exports = model;

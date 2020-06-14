/*
 * Command parser class
 */

const models = require("./cmd-models.js");

class CmdOne {

	constructor (commands) {
		if (commands) {
			this.commands = JSON.parse(JSON.stringify(commands));
		}
		else
			this.commands = {};
		this.applicationName = "";
		this.aliases = {};
		this.buildAliasList();
		this.setArgumentModel("unix");
		this.handlers = {};

		this.setHandler("help", this.handleHelp.bind(this));
		this.setHandler("test-cmd", this.handleTest.bind(this));
	}

	setApplicationName (name) {
		this.applicationName = name;
	}

	setArgumentModel (model) {
		if (typeof(model) === "string")
			this.argumentModel = CmdOne.presetArgumentModel(model);
		else
			this.argumentModel = model;
		this.prepareCommands();
	}

	loadCommandList (list) {
		for (let i in list)
			this.commands[i] = list[i];
		this.buildAliasList();
		this.prepareCommands();
	}

	setHandler (cmd, fun) {
		this.handlers[cmd] = fun;
	}

	prepareCommands () {
		for (let i in this.commands) {
			this.argumentModel.prepareCommand(this.commands[i]);
		}
	}

	buildAliasList () {
		this.aliases = {};
		for (let i in this.commands) {
			this.aliases[i] = i;
			if (this.commands[i].alias)
				this.commands[i].alias.map((item) => this.aliases[item] = i);
		}
	}

	getCommandByName (name) {
		let ret = this.commands[name];
		if (!ret)
			return null;
		ret.name = name;
		return ret;
	}

	getCommandByAlias (alias) {
		let name = this.aliases[alias];
		if (!name)
			return null;
		return this.getCommandByName(name);
	}

	parse (cmd) {
		return this.argumentModel.parseArgs(cmd, this);
	}

	execute (cmd) {
		if (cmd instanceof Array)
			cmd = this.parse(cmd);
		if (cmd.error)
			return { error: cmd.error };
		if (!this.handlers[cmd.cmdName])
			return { error: "No handler defined for command " + cmd.cmdName + " (" + cmd + ")" };
		return this.handlers[cmd.cmdName](cmd.args);
	}

	handleCommandHelp (command) {
		let out = [];
		out.push( (this.applicationName ? this.applicationName + " " : "") + "Command Utility Help");
		out.push("");
		out.push(command + " command");
		command = this.commands[command];
		out.push("");
		out.push("  " + command.description);
		if (command.help) {
			out.push("");
			out = out.concat(command.help.map((item) => "  " + item));
		}
		out.push("");
		console.log(out.join("\n"));
		return out;
	}

	handleHelp (args) {
		if (args.command && this.commands[args.command] !== undefined)
			return this.handleCommandHelp(args.command);
		let out = [];
		out.push( (this.applicationName ? this.applicationName + " " : "") + "Command Utility Help");
		out.push("");
		out.push("available commands");
		for (let i in this.commands) {
			out.push(i + ":    " + this.commands[i].description);
			out.push("  aliases: " + this.commands[i].alias.join(" "));
			out.push("  list args: " + (this.commands[i].listArgs ? this.commands[i].listArgs.join(" ") : "none"));
			let valueArgs = [];
			if (this.commands[i].valueArgs)
				for (let j in this.commands[i].valueArgs)
					valueArgs.push(j);
			out.push("  value args: " + valueArgs.join(" "));
			out.push("");
		}
		console.log(out.join("\n"));
		return out;
	}

	handleTest (args) {
		console.log("Default test function");
		console.log("arguments:");
		console.log(args);
	}

}

CmdOne.presetArgumentModel = function (model) {
	return models[model];
};

module.exports = CmdOne;

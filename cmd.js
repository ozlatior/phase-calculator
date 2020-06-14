/*
 * Main command execution script
 */

let commandString = process.argv.slice(2);

const config = require("./config.json");
const commands = require("./src/phase-commands.js");
const handlers = require("./src/phase-handlers.js");

const CmdOne = require("./src/cmd-one.js");
const Environment = require("./src/environment.js");
const TableOne = require("./src/table-one.js");

const cmd = new CmdOne(commands.commandList);
const env = new Environment(config);

const outputFn = function (output) {
	if (output instanceof Array)
		return console.log("\n" + output.join("\n") + "\n");
	let table = new TableOne();
	if (output.header)
		table.insertDataRow(output.header);
	if (output.data)
		output.data.map((item) => table.insertDataRow(item));
	console.log("\n" + output.before.join("\n") + "\n");
	if (table.getRowCount()) {
		console.log(table.toString());
		console.log("\n" + output.after.join("\n") + "\n");
	}
	else
		console.log(output.after.join("\n") + "\n");
};

env.setOutputFunction(outputFn);

handlers.register(cmd, env);

let res = cmd.execute(commandString);

if (res && res.error) {
	console.log("ERROR: " + res.error);
	process.exit(-1);
}

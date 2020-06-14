module.exports = {
	argumentModel: "unix",
	commandList: {
		"help": {
			alias: [ "h" ],
			listArgs: [ "command" ],
			valueArgs: {},
			description: "Display this help text or more information about a command",
			help: [
				"The help command displays a list of all commands and the accepted arguments",
				"Call it with a <command> argument to get a help text for the specified command"
			]
		},
		"list": {
			alias: [ "l" ],
			listArgs: [ "itemType" ],
			argCount: 0,
			description: "List all items of type <itemType> or all item types of no argument is given",
			help: [
				"List all items of type <itemType> or all item types if no argument is given"
			]
		},
		"test-cmd": {
			alias: [ "T", "tc", "run-test" ],
			listArgs: [ "testName", "subtestName" ],
			valueArgs: {
				"arg1": { alias: [ "1" ], equal: "=" },
				"arg2": { alias: [ "2" ], equal: "=" },
				"arg3": { alias: [ "3" ], equal: "=" }
			},
			description: [ "Run a test command" ],
			help: [
				"Run a test command"
			]
		}
	}
};

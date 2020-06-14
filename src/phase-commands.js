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
		"info": {
			alias: [ "i" ],
			description: "Get information about an item --<itemType>=<itemName>",
			valueArgs: {
				"object": { alias: [ "o" ], equal: "=" }
			},
			help: [
				"Availble item types are 'object'"
			]
		},
		"phase": {
			alias: [ "phases", "p" ],
			description: "Get phase information",
			valueArgs: {
				"object": { alias: [ "o" ], equal: "=" },
				"info" : { alias: [ "i" ] },
				"list" : { alias: [ "l" ] },
				"next": { alias: [ "n" ] },
				"previous": { alias: [ "p" ] },
				"current": { alias: [ "c" ] },
				"index" : { alias: [ "i" ], equal: "=" },
				"count" : { alias: [ "k" ], equal: "=" },
				"date": { alias: [ "d" ], equal: "=" }
			},
			help: [
				"phase info(i) --object=<object>",
				"  get general phase information for selected object",
				"phase list(l) --object=<object> --index=<index> --count=<count>",
				"  list all phases starting from index",
				"phase next(n)/previous(p) --object=<object> --date=<date> --count=<count>",
				"  list all phases strating from / leading to date",
				"",
				"Argument aliases and details:",
				"  --object -o: selected object",
				"  --count -k:  how many phase steps to list, eg --count=10, defaults to value set in config file",
				"  --date -d:   date to start listing from, use quotes: '06-07-2020 13:00:00', defaults to current",
				"  --index -i:  index to start listing from, eg --index=35, defaults to 0"
			]
		},
		"observation": {
			alias: [ "observations", "o" ],
			description: "Get or set observation information",
			valueArgs: {
				"object": { alias: [ "o" ], equal: "=" },
				"list" : { alias: [ "i" ] },
				"current": { alias: [ "c" ] },
				"next": { alias: [ "n" ] },
				"previous": { alias: [ "p" ] },
				"add": { alias: [ "a" ] },
				"remove": { alias: [ "r" ] },
				"message": { alias: [ "m", "details" ], equal: "=" },
				"all": {},
				"step": { alias: [ "s", "phase" ], equal: "=" },
				"index": { alias: [ "i" ], equal: "=" },
				"missing": { alias: [ "x" ], equal: "=" },
				"date": { alias: [ "d" ], equal: "=" },
				"count": { alias: [ "k" ], equal: "=" }
			},
			help: [
				"observation list(l) --object=<object> --index=<index> --count=<count> --missing=<missing>",
				"  list all observations starting from index",
				"observation current(c) --object=<object> --date=<date> --missing=<missing>",
				"  list all observations in the current/selected visibility interval",
				"observation next(n)/previous(p) --object=<object> --date=<date> --count=<count> --missing=<missing>",
				"  list all observations in the intervals starting from / leading to the selected date",
				"observation add(a) --object=<object> --step=<step> --date=<date> --message=<message>",
				"  add a new observation for this object for a specific phase step",
				"observation remove(r) --object=<object> --step=<step> --index=<index>",
				"  remove observation for step and index for this object",
				"observation remove(r) --object=<object> --step=<step> --all",
				"  remove all observations for a specific step for this object",
				"",
				"Arguments aliases and details:",
				"  --object -o:  selected object",
				"  --all:        for remove, remove all observations for selected step",
				"  --count -k:   for list, the number of observations to list (defaults to config value)",
				"                for next/previous, the number of visibility intervals to display (defaults to 1)",
				"  --date -d:    current date for this command, use quotes: '06-07-2020 13:00:00', defaults to current",
				"  --index -i:   for list, index (step) to start listing from, eg --index=35, defaults to 0",
				"                for remove, observation index to remove, mandatory argument",
				"  --message --details -m: set the details message for an observation",
				"  --missing -x: only display observations with or without records (boolean, y/t/yes/true/n/f/no/false)",
				"                defaults to unset, which displays all observations",
				"  --step --phase -s: for remove, step/phase index to remove observations from"
			]
		}
	}
};

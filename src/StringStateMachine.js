/**
 * StringStateMachine.js
 * ----------------
 * State Machine that works on Strings. For a State Machine that work on Arrays see ArrayStateMachine.js.
 * 
 * 
Possible Features:
 > add events so you can be notified when any stateFunctions are (or a specific stateFunction is) executed.
 > 
 */

(function(context) {	
	"use strict";
	
	var StringStateMachine = function (options) {
		var me = this; // stopped using self because self is used in the Web Worker context; "machine" was a close second; me was shorter.
		
		// test
		console.log(me);
		
		// So developers don't need to use "new" to make a new machine.
		if (me === undefined) {
			me = new StringStateMachine(options);
		}
		
		// setup variables to their defaults
		me.cursor = 0;				// the current index position of the cursor
		me.input = ""; 				// may be blank on init but not before running
		me.items = [];				// array of items captured (and maybe sent to parser)
		me.itemTypes = null;		// ItemTypes used in stateFunctions
		me.parser = null; 			// ArrayStateMachine
		me.ready = false;			// ready state is false to begin with.
		me.start = 0;				// the start index of the current 
		me.state = null;			// will be initialized during init phase.
		me.stateFunctions = null;	// statefunctions for this machine
		me.width = 0;				// width of the current rune
		me.currentStateName = undefined;	// 
		me.machineStarted;
		me.machineFinished;

		// deal with options with a function
		me.options = options;
		
		// warm up the machine! (processes the options)
		me.startup();
		
		console.log(me);
		// return
		return me;
	};



	StringStateMachine.prototype = {
		constructor: StringStateMachine,
		
		// Object Methods
		
		/** accept(text)
		 * @description - Accepts any one of the given possible characters
		 * @parameters: text - <string>
		 * Returns: true/false/me.eof     me.eof by default equals null
		 */
		accept: function (text) {
		 	var me = this;
			
			return me;
		},
		
		
		/** checkInput(input)
		 * @description
		 * 	: Checks if the give value is a string and not empty
		 * @parameters
		 * 	: input - the value to check
		 * @returns
		 * 	: true/false; true if input is a string that's not empty
		 */
		checkInput: function (input) {
			var me = this;
			
			return (typeof input === 'string' && input.length > 0);
		},
			
		
		/** checkParser(parser)
		 * @description
		 * 	: checks to see if the parser is "OK"; Parser is allowed to be null or undefined; pretty much anything.
		 * @parameters
		 * 	: parser - the value to check
		 * @returns
		 * 	: true/false; true if it is OK; false otherwise
		 */
		checkParser: function (parser) {
			var me = this;
			
			// typeof null === 'object' so will pass if null too.
			if (typeof parser === 'object' || typeof parser === 'undefined') {
				return true;
			}
			
			return false;
		},
		
			
		/** checkItemTypes(itemTypes)
		 * @description
		 * 	: checks to make sure each property in the object
		 * @parameters
		 *	: itemTypes - the itemTypes this machine will need
		 * @returns
		 * 	: true/false; true if itemTypes is OK; false if it is not valid;
		 */
		checkItemTypes: function (itemTypes) {
			var me = this,
				prop;
				
			if (typeof itemTypes === 'object' && itemTypes !== null) {
				for (prop in itemTypes) {
					if (!itemTypes.hasOwnProperty(prop) || typeof itemTypes[prop] !== 'number') {
						return false;
					}
				}
			}
			else {
				return false;
			}
			return true;
		},
		
		
		/** checkStateFunctions(stateFunctions)
		 * @description
		 * 	: checks to make sure each property in the object
		 * @parameters
		 * 	: stateFuncs - the state function object you want to check; will use me.stateFunctions if stateFuncs is falsey.
		 * @returns
		 * 	: true/false; true if there is an "init" and all other items are functions (or null); false otherwise.
		 */
		checkStateFunctions: function (stateFuncs) {
			var me = this,
				func,
				hasInit = false;
			
			if (typeof stateFuncs !== 'undefined' && stateFuncs !== null && typeof stateFuncs === 'object') {
				for (func in stateFuncs) {
					// make sure the item is a function or null.
					if (stateFuncs.hasOwnProperty(func) && (typeof stateFuncs[func] === 'function' || stateFuncs[func] === null)) {
						if (func === "init") {
							hasInit = true;
						}
					}
					else {
						return false;
					}
				}
			} // if stateFuncs is falsey || undefined || typeof is not an object || stateFuncs["init"] property is falsey.
			else {
				return false;
			}
			
			if (!hasInit) {
				return false;
			}
			
			return true;
		},
		
		
		/** set(key, value)
		 * @description
		 * 	: sets one of the option properties: input, parser, itemTypes, stateFunctions, etc.
		 * 
		 * @parameters
		 *  : key - the name of the property
		 * 	: value - the value of the property
		 * 
		 * @returns 
		 * 	: true if properly set; false otherwise.
		 *
		 * @usage:
		 * 	: var lexer = StringStateMachine();
		 * 	  lexer.set("input", input);
		 * 	  lexer.set("parser", parser);
		 * 	  lexer.set("stateFunctions", stateFunc);
		 * 	  lexer.set("itemTypes", itemTypes);
		 * 	  lexer.run();
		 * 	
		 */
		set: function (key, value) {
			var me = this;
			
			switch (key) {
				case "stateFunctions":
				return me.setStateFunctions(value);
					
				case "parser":
				return me.setParser(value);
					
				case "input":
				return me.setInput(value);
					
				case "itemTypes":
				return me.setItemTypes(value);
				
				default:
				return false;
			}
		},
		
		
		/** setInput(input)
		 * @description
		 * 	: sets the input property
		 * 
		 * @parameters
		 * 	: value - the value of the property
		 * 
		 * @returns 
		 * 	: true if properly set; false otherwise.
		 *
		 * @usage:
		 * 	: var lexer = StringStateMachine();
		 * 	  lexer.setInput(input);
		 * 	  lexer.set("parser", parser);
		 * 	  lexer.set("stateFunctions", stateFunc);
		 * 	  lexer.set("itemTypes", itemTypes);
		 * 	  lexer.run();
		 * 	
		 */
		setInput: function (input) {
			var me = this;
			
			if (me.checkInput(input)) {
				console.log('set input');
				me.input = input;
				return true;
			}
			return false;
		},			
		
		
		
		/** setItemTypes(value)
		 * @description
		 * 	: sets the itemTypes property
		 * 
		 * @parameters
		 * 	: value - the value of the property
		 * 
		 * @returns 
		 * 	: true if properly set; false otherwise.
		 *
		 * @usage:
		 * 	: var lexer = StringStateMachine();
		 * 	  lexer.setInput(input);
		 * 	  lexer.set("parser", parser);
		 * 	  lexer.setStateFunctions(stateFunc);
		 * 	  lexer.setItemTypes(itemTypes);
		 * 	  lexer.run();
		 * 	
		 */
		setItemTypes: function (itemTypes) {
			var me = this;
			
			if (me.checkItemTypes(itemTypes)) {
				console.log('set item types');
				me.itemTypes = itemTypes;
				return true;
			}
			return false;
		},		
		
		
		
		/** setParser(value)
		 * @description
		 * 	: sets the parser property
		 * 
		 * @parameters
		 * 	: value - the value of the property
		 * 
		 * @returns 
		 * 	: true if properly set; false otherwise.
		 *
		 * @usage:
		 * 	: var lexer = StringStateMachine();
		 * 	  lexer.setInput(input);
		 * 	  lexer.setParser(parser);
		 * 	  lexer.setStateFunctions(stateFunc);
		 * 	  lexer.set("itemTypes", itemTypes);
		 * 	  lexer.run();
		 * 	
		 */
		setParser: function (parser) {
			var me = this;
			
			if (me.checkParser(parser)) {
				console.log('set parser');
				me.parser = parser;
				return true;
			}
			return false;
		},	
		
		
		
		/** setReadyState()
		 * @description
		 * 	: checks the properies and sets the this/me.ready property appropriately.
		 * 
		 * @parameters: none
		 * 
		 * @returns
		 * 	: true if "ready" is true; false otherwise.
		 */
		setReadyState: function () {
			var me = this;
			// test to see if it's all ready
			me.ready = (me.checkStateFunctions(me.stateFunctions) && me.checkInput(me.input) && me.checkParser(me.parser) && me.checkItemTypes(me.itemTypes));
			console.log('me.ready: ' + me.ready);
			return me.ready;
		},		
		
		
		/** setStateFunctions(stateFuncs)
		 * @description
		 * 	: sets the stateFunctions property
		 * 
		 * @parameters
		 * 	: value - the value of the property
		 * 
		 * @returns 
		 * 	: true if properly set; false otherwise.
		 *
		 * @usage:
		 * 	: var lexer = StringStateMachine();
		 * 	  lexer.setInput(input);
		 * 	  lexer.set("parser", parser);
		 * 	  lexer.setStateFunctions(stateFunc);
		 * 	  lexer.set("itemTypes", itemTypes);
		 * 	  lexer.run();
		 * 	
		 */
		setStateFunctions: function (stateFunctions) {
			var me = this;
			
			if (me.checkStateFunctions(stateFunctions)) {
				console.log('set stateFunctions');
				console.dir(stateFunctions);
				me.stateFunctions = stateFunctions;
				console.dir(me.stateFunctions);
				return true;
			}
			return false;
		},
		
		
		/** startup()
		 * Processes options and prepares the machine for running.
		 * 
		 */
		startup: function () {
			var me = this,
				o = me.options,
				stateFuncB = false,
				inputB = false,
				parserB = false,
				itemTypesB = false;
				
			console.log('Starting up....')
			me.cursor = 0;
			me.input = "";
			me.items = [];
			me.itemTypes = null;
			me.parser = null;
			me.ready = false;
			me.start = 0;
			me.state = null;
			me.stateFunctions = null;
			me.width = 0;
			
			
			/** Data Tests -----------------------------
			 * do them each in their own statements; thought about doing in the me.ready assignment 
			 * but that could shortcircuit if an earlier "set" fails.
			 */
			if (typeof o === 'object' && o !== null) {
				// stateFunctions 
				console.log('Got stateFunctions');
				stateFuncB = me.setStateFunctions(o.stateFunctions);
			
				// input
				console.log('got input');
				inputB = me.setInput(o.input);
			
				// itemTypes
				console.log('got item types');
				itemTypesB = me.setItemTypes(o.itemTypes);
			
				// parser
				console.log('got parser');
				parserB = me.setParser(o.parser);
				// ---------------------------------------
			}
			// test to see if it's all ready
			me.ready = (stateFuncB && inputB && parserB && itemTypesB);
			
			return me;
		},
		
		
		/** run()
		 * The Machine Loop; The heart of the machine.
		 * 
		 */
		run: function () {
			var me = this;
			
			me.setReadyState();
			
			if (me.ready !== true) {
				return me;
			}
			
			console.log('Running....');
			
			// # no block on this for loop; this is on purpose; 
			// using me.runStateFunction(...) instead of me.state(me) so I can fire custom events.
			//for (me.state = me.stateFunctions["init"]; me.state !== null; me.state = me.state(me)); 
			
			for (me.state = "init"; me.state !== null; me.state = me.runStateFunction(me.state, me)); 
			
			console.log('Finished.');
			
			return me;
		},
		
		
		/** runStateFunction(name, machine);
		 * A function used in run() to allow for events before and after invocation of each stateFunction.
		 * 
		 * @returns: the next state's name.
		 */
		runStateFunction: function (name, machine) {
			var me = this,
				beforeEvent,
				beforeEventSpecific,
				afterEvent,
				afterEventSpecific,
				nextStateName;
								
			if (typeof window !== 'undefined') {
				
				// make events
				beforeEvent = new CustomEvent('beforeInvocation', {
					detail: {
						functionName: name,
						time: new Date()
					},
					bubbles: true, // also test with false;
					cancelable: true
				});
				beforeEventSpecific = new CustomEvent('beforeInvocation.' + name + '', {
					detail: {
						functionName: name,
						time: new Date()
					},
					bubbles: true, // also test with false;
					cancelable: true
				});
				
				// fire events
				document.dispatchEvent(beforeEventSpecific);
				document.dispatchEvent(beforeEvent);
				
				// function invocation
				nextStateName = me.stateFunctions[name](machine);
				
				// make events
				afterEvent = new CustomEvent('afterInvocation', {
					detail: {
						functionName: name,
						time: new Date()
					},
					bubbles: false,
					cancelable: true
				});
				afterEventSpecific = new CustomEvent('afterInvocation.' + name + '', {
					detail: {
						functionName: name,
						time: new Date()
					},
					bubbles: false,
					cancelable: true
				});
				
				// fire events
				document.dispatchEvent(afterEventSpecific);
				document.dispatchEvent(afterEvent);
			}
			return nextStateName;
		}
		
		
	};

	context.StringStateMachine = StringStateMachine;
}(this));
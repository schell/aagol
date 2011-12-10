/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *	aagol.js
 *	Another Automaton Game Of Life
 *	Copyright (c) 2011 Schell Scivally Enterprise. All rights reserved.
 *
 *	@author	Schell Scivally
 *	@since	Thu Dec  8 17:49:46 PST 2011
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * **/
var aagol = mod({
	name : 'aagol',
	dependencies : [],
	init : function (modules) {
		/**
		 *	Initializes the aagol object
		 */
		var states = {
			/**
			 *	Our cell states.
			 */
			'0' : 'empty',
			'1' : 'block',
			'2' : 'like program',
			'3' : 'resource',
			'X' : 'program'
		};
		
		var packState = function (expandedState) {
			/**
			 * Packs a state from a (possibly) expanded representation
			 * 000 
			 * 0X0
			 * 000
			 * into 0000X0000
			 */
			expandedState = expandedState.replace(/\n|\s/g, '');
			return expandedState;
		};
		
		var logs = [];
		var log = function () {
			console.warn(arguments);
			logs.push(Array.prototype.slice.call(arguments));
		};
		var clearLog = function () {
			logs = [];
		};
		var getLog = function () {
			return logs;
		};
		
		var isValidState = function (state) {
			/**
			 *	Checks a state for validity.
			 */
			state = packState(state);
			var regex = /^[0-3|X]{9}$/;
			var match = state.match(regex);
			if (match && match.length == 1 && match[0] == state) {
				return true;
			}
			log('invalid state:',state,'state can only characters 0-3 or X and must be 9 characters long');
			return false;
		};
		
		var isValidPretransition = function (state) {
			/**
			 *	Checks a pretransition for validity.
			 */
			var packed = packState(state);
			if (!isValidState(packed)) {
				log('invalid pretransition:',state,'(is invalid state)');
				return false;
			}
			if (packed[4] !== 'X') {
				log('invalid pretransition:',state,'(program is not in center of state)');
				return false;
			}
			return true;
		};
		
		var isValidTransition = function (pre, post) {
			/**
			 *	Checks to see if given *pre*, *post* is valid.
			 */
			packedPre = packState(pre);
			packedPost = packState(post);
			if (packedPre == packedPost) {
				log('invalid transition:',pre,post,'no transition occurs');
				return false;
			}
			if (!isValidState(packedPre)) {
				log('invalid transition:',pre,post,'pretransition is invalid state');
				return false;
			}
			if (!isValidState(packedPost)) {
				log('invalid transition:',pre,post,'posttransition is invalid state');
				return false;
			}
			if (!isValidPretransition(packedPre)) {
				log('invalid transition:',pre,'pretransition is not valid');
			}
			var getNdxsOf = function (char, string) {
				/**
				 *	Returns the indices of char in string
				 */
				var ndxs = [];
				var n = string.length;
				for (var i = n - 1; i >= 0; i--) {
					if (string[i] == char) {
						ndxs.push(i);
					}
				}
				return ndxs;
			};
			
			var ndxsAreEq = function (ndx1, ndx2) {
				/**
				 *	Returns true if ndx1 is similar to ndx2, false if not
				 */
				var n = ndx1.length;
				if (n !== ndx2.length) {
					return false;
				}
				for (var i = n - 1; i >= 0; i--) {
					if (ndx1[i] !== ndx2[i]) {
						return false;
					}
				}
				return true;
			};
			
			var diff = function (string1, string2) {
				/**
				 *	Returns the indices that differ between two strings
				 */
				var ndxs = [];
				var n = string1.length;
				for (var i = n - 1; i >= 0; i--) {
					if (string1[i] !== string2[i]) {
						ndxs.push(i);
					}
				}
				return ndxs;
			};
			
			var isUntouched = function (char) {
				var preNdxs = getNdxsOf(char, packedPre);
				var postNdxs = getNdxsOf(char, packedPost);
				if (!ndxsAreEq(preNdxs, postNdxs)) {
					log('invalid transition:',pre,post,'cannot add, delete or move '+states[char]);
					return false;
				}
				return true;
			};
			
			// check to see that resources are untouched
			if (!isUntouched('3')) {
				return false;
			}
			// check to see that like programs are untouched
			if (!isUntouched('2')) {
				return false;
			}
			// check to see that block transitions are valid
			var preBlkNdxs = getNdxsOf('1', packedPre);
			var pstBlkNdxs = getNdxsOf('1', packedPost);
			if (preBlkNdxs.length != pstBlkNdxs.length) {
				// a block has been added or deleted
				log('invalid transition:',pre,post,'cannot add, delete or replace a block');
				return false;
			}
			if (!ndxsAreEq(preBlkNdxs, pstBlkNdxs)) {
				// a block has moved
				var preProgNdxs = getNdxsOf('X', packedPre);
				var postProgNdxs = getNdxsOf('X', packedPost);
				if (preProgNdxs.length != postProgNdxs) {
					log('invalid transition:',pre,post,'cannot add, delete or replace program and switch places with a block');
					return false;
				}
				
				var diffNdxs = diff(packedPre, packedPost);
				if (diffNdxs.length > 2) {
					// more than one block has moved
					log('invalid transition:',pre,post,'a program cannot move more than one block');
					return false;
				}
			}
			
			return true;
		};
		
		var createProgramEditor = function () {
			var editor = document.createElement('fieldset');
			editor.id = 'stateEditor';
			
			var title = document.createElement('legend');
			title.id = 'stateEditor_title';
			title.innerHTML = 'aagol program editor';
			editor.appendChild(title);
			
			var areaCSS = 'width:3.5em; height:5em; resize:none; padding:0.5em;';
			
			var preArea = document.createElement('textArea');
			preArea.id = 'pre_editor';
			preArea.style.cssText = areaCSS;
			editor.appendChild(preArea);
			
			var postArea = document.createElement('textArea');
			postArea.id = 'post_editor';
			postArea.style.cssText = areaCSS;
			editor.appendChild(postArea);
			
			var br = document.createElement('br');
			editor.appendChild(br);
			
			var addButton = document.createElement('input');
			addButton.type = 'submit';
			addButton.value = 'add';
			addButton.disabled = true;
			editor.appendChild(addButton);
			
			var output = document.createElement('fieldset');
			output.id = 'editor_output';
			
			var outputTitle = document.createElement('legend');
			outputTitle.innerHTML = 'console';
			output.appendChild(outputTitle);
			editor.appendChild(output);
			
			var outputValue = document.createElement('div');
			outputValue.id = 'editor_output_value';
			output.appendChild(outputValue);
			
			var changeOutput = function (isValid) {
				var msg = '';
			
				if (!isValid) {
					outputValue.style.cssText = 'color:red;';
					var n = logs.length;
					for (var i = n - 1; i >= 0; i--) {
						var args = logs[i];
						for (var j = 0; j < args.length; j++) {
							msg += args[j].toString() + ' - ';
						}
						msg += '<br/>';
					}
				} else {
					outputValue.style.cssText = 'color:green;';
					msg = 'okay!';
				}
			
				document.getElementById('editor_output_value').innerHTML = msg;
			}
			
			var prechange = function () {
				preArea.value = packState(preArea.value.substring(0, 9));
				logs = [];
				var isValid = isValidPretransition(preArea.value);
				var msg = '';
			
				changeOutput(isValid);
				return isValid;
			};
			
			var postchange = function () {
				postArea.value = packState(postArea.value.substring(0, 9));
				logs = [];
				var isValid = isValidState(postArea.value);
				changeOutput(isValid);
				return isValid;
			};
			
			var testChange = function () {
				addButton.disabled = true;
				if (preArea.value != '' && prechange()) {
					if (postArea.value != '' && postchange()) {
						logs = [];
						var isValid = isValidTransition(preArea.value, postArea.value);
						changeOutput(isValid);
						if (isValid) {
							addButton.disabled = false;
						}
					}
				}
			};
			
			preArea.onchange = testChange;
			postArea.onchange = testChange;
			
			var pgmDefSet = document.createElement('fieldset');
			editor.appendChild(pgmDefSet);
			var pgmTitle = document.createElement('legend');
			pgmTitle.innerHTML = 'program defintion';
			pgmDefSet.appendChild(pgmTitle);
			editor.appendChild(pgmDefSet);
			var pgmStates = document.createElement('div');
			pgmDefSet.appendChild(pgmStates);
			
			var states = 0;
			var addTransition = function (pre, post) {
				var div = document.createElement('div');
				div.id = 'state_'+(states++).toString();
				div.style.cssText = 'background-color:#AFAFAF; padding:0.5em; float:left;';
				div.innerHTML = pre + ' ' + post;
				pgmStates.appendChild(div);
			};
			
			addButton.onclick = function () {
				addTransition(preArea.value, postArea.value);
			};
			
			return editor;
		};
		
		
		return {
			states : states,
			clearLog : clearLog,
			getLog : getLog,
			packState : packState,
			isValidState : isValidState,
			isValidPretransition : isValidPretransition,
			isValidTransition : isValidTransition,
			createProgramEditor : createProgramEditor
		};
	}
});
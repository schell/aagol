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
	dependencies : ['http://crypto-js.googlecode.com/files/2.3.0-crypto-md5.js'],
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
			'X' : 'program',
			'.' : 'wildcard'
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
		var warn = function () {
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
			var regex = /^[0-3|X|\.]{9}$/;
			var match = state.match(regex);
			if (match && match.length == 1 && match[0] == state) {
				return true;
			}
			warn('invalid state:',state,'state can only characters 0-3, X or "." and must be 9 characters long');
			return false;
		};
		
		var isValidPretransition = function (state) {
			/**
			 *	Checks a pretransition for validity.
			 */
			var packed = packState(state);
			if (!isValidState(packed)) {
				warn('invalid pretransition:',state,'(is invalid state)');
				return false;
			}
			if (packed[4] !== 'X') {
				warn('invalid pretransition:',state,'(program is not in center of state)');
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
				warn('invalid transition:',pre,post,'no transition occurs');
				return false;
			}
			if (!isValidState(packedPre)) {
				warn('invalid transition:',pre,post,'pretransition is invalid state');
				return false;
			}
			if (!isValidState(packedPost)) {
				warn('invalid transition:',pre,post,'posttransition is invalid state');
				return false;
			}
			if (!isValidPretransition(packedPre)) {
				warn('invalid transition:',pre,'pretransition is not valid');
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
					warn('invalid transition:',pre,post,'cannot add, delete or move '+states[char]);
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
			// check to see that wildcards are untouched
			if (!isUntouched('.')) {
				return false;
			}
			
			// check to see that block transitions are valid
			var preBlkNdxs = getNdxsOf('1', packedPre);
			var pstBlkNdxs = getNdxsOf('1', packedPost);
			if (preBlkNdxs.length != pstBlkNdxs.length) {
				// a block has been added or deleted
				warn('invalid transition:',pre,post,'cannot add, delete or replace a block');
				return false;
			}
			if (!ndxsAreEq(preBlkNdxs, pstBlkNdxs)) {
				// a block has moved
				var preProgNdxs = getNdxsOf('X', packedPre);
				var postProgNdxs = getNdxsOf('X', packedPost);
				if (preProgNdxs.length != postProgNdxs.length) {
					warn('invalid transition:',pre,post,'cannot add, delete or replace program and switch places with a block');
					return false;
				}
				
				var diffNdxs = diff(packedPre, packedPost);
				if (diffNdxs.length > 2) {
					// more than one block has moved
					warn('invalid transition:',pre,post,'a program cannot move more than one block');
					return false;
				}
			}
			
			return true;
		};
		
		var isValidProgram = function (program) {
			var invalidTransitions = 0;
			var regex = /^[0-3|X|\.]{9}:[0-3|X|\.]{9}$/;
			var validatedTransitions = program.split(' ').filter(function (transition,ndx,a) {
				return transition !== '' && transition !== '\n';
			}).map(function (transition,ndx,a) {
				var pair = transition.split(':');
				if (!isValidTransition(pair[0], pair[1])) {
					warn('invalid program:',program,transition,ndx,'is invalid transition');
					invalidTransitions++;
					return false;
				}
				return true;
			});
			
			if (invalidTransitions) {
				warn('invalid program:',program,invalidTransitions,'invalid transition(s)');
				return false;
			}
			
			return true;
		};
		
		var gui = (function createGuiTools () {
			/**
			 *	Creates an object of gui tool constructors.
			 */
			var createSet = function (innerHTML) {
				/**
				 *	Creates a labled html fieldset.
				 */
				var set = document.createElement('fieldset');

				var legend = document.createElement('legend');
				legend.innerHTML = innerHTML;
				set.appendChild(legend);
				return set;
			};
			
			var createProgramEditor = function () {
				/**
				 *	Creates a program editor in html.
				 */
				var editor = createSet('editor');
				editor.style.cssText = 'float:left;';

				var transitionSet = createSet('transition editor');
				editor.appendChild(transitionSet);

				var areaCSS = "overflow:hidden; width:2em; height:4em; resize:none; font-family: 'Inconsolata', sans-serif; font-size:1em;";

				var truncateOnKeyDown = function (e) {
					e.srcElement.value = e.srcElement.value.substr(0, 9);
				};

				var preArea = document.createElement('textArea');
				preArea.id = 'pre_editor';
				preArea.style.cssText = areaCSS;
				preArea.onkeydown = truncateOnKeyDown;
				preArea.value = '0000X0000';
				transitionSet.appendChild(preArea);

				var postArea = document.createElement('textArea');
				postArea.id = 'post_editor';
				postArea.style.cssText = areaCSS;
				postArea.onkeydown = truncateOnKeyDown;
				postArea.value = 'XXXX0XXXX';
				transitionSet.appendChild(postArea);

				var progSet = createSet('program editor');
				editor.appendChild(progSet);

				var progArea = document.createElement('textArea');
				progArea.id = 'prog_editor';
				progArea.style.cssText = "margin:auto; font-family: 'Inconsolata', sans-serif; font-size:1em; width:12em; height:18em;";
				progSet.appendChild(progArea);

				var addButton = document.createElement('input');
				addButton.type = 'submit';
				addButton.style.cssText = 'height:5em;';
				addButton.value = 'add';
				transitionSet.appendChild(addButton);

				var output = createSet('console');
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
				};

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
				progArea.onchange = function () {
					checkProgram(progArea.value);
				};

				var checkProgram = function (program) {
					var isValid = isValidProgram(program);
					changeOutput(isValid);
					if (isValid) {
						var sim = aagol.simulator;
						if (sim) {
							var img = document.getElementById('aagol_simulator_program_img');
							if (img) {
								aagol.simulator.removeChild(img);
							}
							img = createMD5HashPicture(Crypto.MD5(program));
							img.id = 'aagol_simulator_program_img';
							img.cssText = 'float:right;';
							sim.appendChild(img);
						}
					}
					return isValid;
				};

				var addTransition = function (pre, post) {
					var transition = pre+':'+post+' ';
					var newProgram = progArea.value + transition;
					logs = [];
					var isValid = checkProgram(newProgram);
					if (isValid) {
						progArea.value = newProgram;
					}
				};

				addButton.onclick = function () {
					addTransition(preArea.value, postArea.value);
				};

				return editor;
			};
			
			var createMap = function (w, h) {
				/**
				 *	Creates a 2d array of w x h.
				 */
				var map = [];
				for (var i = 0; i < w; i++) {
					var col = [];
					for (var j = 0; j < h; j++) {
						col.push(0);
					}
					map.push(col);
				}
				return map;
			};
			
			var createSimulator = function () {
				/**
				 *	Creates a simulation area.
				 */
				var sim = createSet('simulator');
				sim.style.cssText = 'width:auto; height:auto;';
				
				var canvas = document.createElement('canvas');
				canvas.id = 'aagol_simulator_canvas';
				canvas.style.cssText = 'width:500px; height:500px; float:left;';
				sim.canvas = canvas;
				sim.appendChild(canvas);
				
				var ctx = canvas.getContext('2d');
				sim.ctx = ctx;
				
				var render = sim.render = function () {
					ctx.save();
					ctx.globalAlpha = 1.0;
					ctx.fillStyle = "rgba(127,127,127,1.0)";
					ctx.strokeStyle = "rgb(0,0,0)";
					ctx.fillRect(0, 0, 640, 480);
					ctx.restore();
				};
				
				aagol.simulator = sim;
				
				render();
				
				return sim;
			};
			
			var createMD5HashPicture = function (hash, w, h) {
				hash = hash || Crypto.MD5('asdf'); // 912ec803b2ce49e4a541068d495ab570
				w = w || 100;
				h = h || 100;
				/**
				 *	Takes an md5 hash and generates a picture symbol representation.
				 */
				var cvs = document.createElement('canvas');
				cvs.width = w;
				cvs.height = h;
				var ctx = cvs.getContext('2d');
				
				var getHexAt = function (s, ndx, width) {
					return Number('0x'+s.substr(ndx, width));
				};
				
				var getRGBAt = function (s, ndx) {
					var r = getHexAt(s, ndx, 2);
					var g = getHexAt(s, ndx+2, 2);
					var b = getHexAt(s, ndx+4, 2);
					return 'rgb('+r+','+g+','+b+')';
				};
				
				var getRGBAAt = function (s, ndx) {
					var r = getHexAt(s, ndx, 2);
					var g = getHexAt(s, ndx+2, 2);
					var b = getHexAt(s, ndx+4, 2);
					var a = getHexAt(s, ndx+6, 2)/255.0;
					return 'rgba('+r+','+g+','+b+','+a+')';
				};
				
				var bkgColor = getRGBAt(hash, 24);
				ctx.fillStyle = bkgColor;
				ctx.fillRect(0, 0, w, h);
				
				var deposits = 1;
				
				var deposit = function (s) {
					ctx.save();
					if (s.length < 8) {
						return;
					}
					var seed = 0;
					var n = 0;
					while (n < 3 || n%2 != 0) {
						n = getHexAt(s, seed++, 1);
					}
					var path = [];
					for (var i = 0; i < n; i++) {
						var x = (getHexAt(s, i%s.length, 1)/16)*(w/2+1);
						var y = (getHexAt(s, (i+1)%s.length, 1)/16)*(h/2+1);
						var point = {
							x:x,
							y:y
						};
						if (x != 0 && y != 0 && getHexAt(s, (i+3)%s.length) > 8 && path.length < 4) {
							point.cpx1 = Math.floor((getHexAt(s, i+4%s.length, 1)/16)*(w/2));
							point.cpy1 = Math.floor((getHexAt(s, (i+5)%s.length, 1)/16)*(h/2));
							point.cpx2 = Math.floor((getHexAt(s, i+6%s.length, 1)/16)*(w/2));
							point.cpy2 = Math.floor((getHexAt(s, (i+7)%s.length, 1)/16)*(h/2));
						}
						path.push(point);
					}
					
					var drawPath = function (p) {
						if (p.length > 2) {
							ctx.moveTo(p[0].x, p[0].y);
							for (var i = 1; i < p.length; i++) {
								if (p[i].cpx1) {
									ctx.bezierCurveTo(p[i].cpx1, p[i].cpy1, p[i].cpx2, p[i].cpy2, p[i].x, p[i].y)
								} else {
									ctx.lineTo(p[i].x, p[i].y);
								}
							}
							ctx.strokeStyle = getRGBAt(s, 4);
							ctx.fillStyle = getRGBAt(s, 3);
							ctx.fill();
							ctx.stroke();
						}
					};
					
					var flip = function (component, about) {
						var distance = about - component;
						return about + distance;
					};
					
					var flipPathHorizontal = function (path) {
						var dx = Math.ceil(w/2);
						return path.map(function (loc,ndx,a) {
							var p = {
								x : flip(loc.x, dx),
								y : loc.y
							};
							if ('cpx1' in loc) {
								p.cpx1 = flip(loc.cpx1, dx);
								p.cpy1 = loc.cpy1;
								p.cpx2 = flip(loc.cpx2, dx);
								p.cpy2 = loc.cpy2;
							}
							return p;
						});
					};
					
					var flipPathVertical = function (path) {
						var dy = Math.ceil(h/2);
						return path.map(function (loc,ndx,a) {
							var p = {
								x : loc.x,
								y : flip(loc.y, dy)
							};
							if ('cpx1' in loc) {
								p.cpx1 = loc.cpx1;
								p.cpy1 = flip(loc.cpy1, dy);
								p.cpx2 = loc.cpx2;
								p.cpy2 = flip(loc.cpy2, dy);;
							}
							return p;
						});
					};
					
					drawPath(path);
					drawPath(flipPathHorizontal(path));
					drawPath(flipPathVertical(path));
					drawPath(flipPathHorizontal(flipPathVertical(path)));
					
					var cipher = function (string) {
						return Array.prototype.slice.apply(string).map(function (char,ndx,a) {
							var number = (Number('0x'+char) + 5)%16;
							return number.toString(16);
						}).join('');
					};
					
					ctx.restore();
					
					if (--deposits) {
						deposit(cipher(s));
					}
				};
				
				deposit(hash.substr(2));
				
				var data = cvs.toDataURL();
				var img = new Image();
				img.src = data;
				return img;
			};
			
			return {
				createSet : createSet,
				createProgramEditor : createProgramEditor,
				createSimulator : createSimulator,
				createMap : createMap,
				createMD5HashPicture : createMD5HashPicture,
			};
		}());
		
		
		return {
			states : states,
			clearLog : clearLog,
			getLog : getLog,
			packState : packState,
			isValidState : isValidState,
			isValidPretransition : isValidPretransition,
			isValidTransition : isValidTransition,
			isValidProgram : isValidProgram,
			gui : gui
		};
	}
});
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
			console.warn('invalid state:',state);
			return false;
		};
		
		var isValidPretransition = function (state) {
			/**
			 *	Checks a pretransition for validity.
			 */
			var packed = packState(state);
			if (!isValidState(packed)) {
				console.warn('invalid pretransition:',state,'(is invalid state)');
				return false;
			}
			if (packed[4] !== 'X') {
				console.warn('invalid pretransition:',state,'(program is not in center of state)');
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
				console.warn('invalid transition:',pre,post,'no transition occurs');
				return false;
			}
			if (!isValidState(packedPre)) {
				console.warn('invalid transition:',pre,post,'pretransition is invalid state');
				return false;
			}
			if (!isValidState(packedPost)) {
				console.warn('invalid transition:',pre,post,'posttransition is invalid state');
				return false;
			}
			if (!isValidPretransition(packedPre)) {
				console.warn('invalid transition:',pre,'pretransition is not valid');
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
					console.warn('invalid transition:',pre,post,'cannot add, delete or move '+states[char]);
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
				console.warn('invalid transition:',pre,post,'cannot add, delete or replace a block');
				return false;
			}
			if (!ndxsAreEq(preBlkNdxs, pstBlkNdxs)) {
				// a block has moved
				var preProgNdxs = getNdxsOf('X', packedPre);
				var postProgNdxs = getNdxsOf('X', packedPost);
				if (preProgNdxs.length != postProgNdxs) {
					console.warn('invalid transition:',pre,post,'cannot add, delete or replace program and switch places with a block');
					return false;
				}
				
				var diffNdxs = diff(packedPre, packedPost);
				if (diffNdxs.length > 2) {
					// more than one block has moved
					console.warn('invalid transition:',pre,post,'a program cannot move more than one block');
					return false;
				}
			}
			
			return true;
		};
		
		var createStateEditor = function () {
			
		};
		
		
		return {
			packState : packState,
			isValidState : isValidState,
			isValidPretransition : isValidPretransition,
			isValidTransition : isValidTransition,
			createStateEditor : createStateEditor
		};
	}
});
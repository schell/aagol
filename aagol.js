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
			0 : 'empty',
			1 : 'block',
			2 : 'program',
			3 : 'resource'
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
			var getNdxsOf = function (char, string) {
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
				ndx1.map(function (el,i,a) {
					if (el !== i) {
						return false;
					}
				});
				return true;
			};
			// check to see that resources are untouched
			var preResNdxs = getNdxsOf('3', packedPre);
			var postResNdxs = getNdxsOf('3', packedPost);
			if (!ndxsAreEq(preResNdxs, postResNdxs)) {
				console.warn('invalid transition:',pre,post,'cannot move resources');
				return false;
			}
			// check to see that program has moved only into empty space
			// or switched places with a block
			
			return true;
		};
		
		
		
		return {
			packState : packState,
			isValidState : isValidState,
			isValidPretransition : isValidPretransition,
			isValidTransition : isValidTransition
		};
	}
});
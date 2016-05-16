var appRoot = require('app-root-path');
var resolveFrom = require('resolve-from');

function plugin(babel) {
	var t = babel.types;

	return {
		visitor: {
			Program: function (path, state) {
				this.translateFunctionName = getTranslateFunctionName(state.opts);
				this.moduleFunction = getModuleFunction(state.opts);
			},

			CallExpression: function (path) {
				if (path.node.callee.name === this.translateFunctionName) {
					visitMatchingFunctionCall(path, this.moduleFunction);
				}
			}
		}
	};

	// get name of function to match in source, from opts passed to plugin
	function getTranslateFunctionName(opts) {
		var translateFunctionName = opts.translateFunctionName || opts.moduleFunctionName;

		if (!translateFunctionName) {
			throwError('No name provided for translation function');
		}

		return translateFunctionName;
	}

	// get module function to perform translation from opts passed to plugin
	function getModuleFunction(opts) {
		var resolvedPath;
		var moduleFunction;

		if (!opts.module) {
			throwError('No path provided for module');
		}

		// resolve provided module path relative to app root
		resolvedPath = resolveFrom(appRoot.path, opts.module);
		if (!resolvedPath) {
			throwError('Failed to resolve module path');
		}

		// get translation function; either the module itself or a
		// named function within the module
		moduleFunction = require(resolvedPath);
		if (opts.moduleFunctionName) {
			moduleFunction = moduleFunction[opts.moduleFunctionName];
		}

		if (typeof moduleFunction !== 'function') {
			throwError('Problem with module. Possibly missing "moduleFunction" option');
		}

		return moduleFunction;
	}

	// replace function call with result of translation, if possible
	function visitMatchingFunctionCall(path, moduleFunction) {
		var args = path.get('arguments').map(getEvaluatedValue);
		var translation, newNode;

		if (args.indexOf(undefined) < 0) {
			translation = moduleFunction.apply(null, args);

			if (typeof translation === 'string') {
				newNode = t.valueToNode(translation);
				path.replaceWith(newNode);
			}
		}
	}

	// return evaluated value of path, or undefined
	function getEvaluatedValue(path) {
		var evaluated = path.evaluate();

		if (evaluated.confident) {
			return evaluated.value;
		}
	}

	function throwError(msg) {
		throw Error('babel-plugin-translate-strings: ' + msg);
	}
}

module.exports = plugin;

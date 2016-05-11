var appRoot = require('app-root-path');
var resolveFrom = require('resolve-from');

function plugin(babel) {
	var t = babel.types;

	return {
		visitor: {
			CallExpression: function (path, state) {
				var opts = state.opts;
				var translateFunction = opts.translateFunction || opts.moduleFunction;
				var translate = getModuleFunction(opts);

				if (!translateFunction) {
					throw Error('No name provided for translation function');
				}

				if (path.node.callee.name === translateFunction) {
					visitMatchingFunctionCall(path, translate);
				}
			}
		}
	};

	// get translate function from opts passed to plugin
	function getModuleFunction(opts) {
		var resolvedPath;
		var translate;

		if (!opts.module) {
			throw Error('No path provided for translation module');
		}

		// resolve provided module path relative to app root
		resolvedPath = resolveFrom(appRoot.path, opts.module);
		if (!resolvedPath) {
			throw Error('Failed to resolve translation module path');
		}

		// get translation function; either the module itself or a
		// named function within the module
		translate = require(resolvedPath);
		if (opts.moduleFunction) {
			translate = translate[opts.moduleFunction];
		}

		if (typeof translate !== 'function') {
			throw Error('Problem with translation module. Possibly missing "moduleFunction" option');
		}

		return translate;
	}

	// replace function call with result of translation, if possible
	function visitMatchingFunctionCall(path, translate) {
		var args = path.get('arguments').map(getEvaluatedValue);
		var translation, newNode;

		if (args.indexOf(undefined) < 0) {
			translation = translate.apply(null, args);

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
}

module.exports = plugin;

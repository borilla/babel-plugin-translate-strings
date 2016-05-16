# Babel-plugin-translate-strings

Babel plugin to translate static strings at compile time

## TOC

* [Installation](#installation)
* [What it does](#what-it-does)
* [Plugin options](#plugin-options)

## Installation

Intall the module using npm. The module isn't published yet but can be installed from the github repo:
```shell
$ npm install --save borilla/babel-plugin-translate-strings
```

Then, in babel configuration (usually in your .babelrc file), add the plugin to your list of plugins:
```json
{
  "plugins": [
    [ "@borilla/babel-plugin-translate-strings", {
      "translateFunctionName": "_T",
      "module": "./src/translate",
      "moduleFunctionName": "translate"
    } ]
  ]
}
```

## What it does

When applied to a source file, this will look through your source for code that looks like a call to `translateFunctionName`, apply the module function to its argument(s) and replace the code with the result, ie
```js
var s = _T('string to translate');   --->   var s = 'the translated string';
```

__Note:__ The translate function can only be applied if we can resolve the arguments' values at compile-time. Internally this uses babel's `path.evaluate()` function, which can only really resolve relatively simple cases. See `/test` files for examples of what can/cannot be currently resolved

## Plugin options

| Option | Description |
| ------ | --- |
| __translateFunctionName__ | Function name to look for in source code |
| __module__ | Path to module containing our translate function (__relative to the root of the application__) |
| __moduleFunctionName__ | Name of the translate function exported by the module. If this is not provided then it is assumed the module exports a single function, which is the translate function |

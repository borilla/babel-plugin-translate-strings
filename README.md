# Babel-plugin-translate-strings

Babel plugin to translate static strings at compile time

## TOC

* [Installation](#installation)
* [Plugin options](#plugin-options)

## Installation

Intall the module using npm. The module isn't published yet but can be installed from the github repo:
```shell
$ npm install --save borilla/babel-plugin-translate-strings
```

Then, in babel configuration (usually in your .babelrc file), add the plugin to your list of plugins:
```
{
  "plugins": [
    [ "@borilla/babel-plugin-translate-strings", {
      "translateFunction": "_T",
      "module": "/src/translate"
    } ]
  ]
}
```

## Plugin options

__`translateFunction`__: Function name to look for in source code

__`module`__: Path to module containing our translate function. In order to find the module, this path must be __relative to the root of the application__

__`moduleFunction`__: Name of the translate function exported by the module. If this is not provided then it is assumed the module exports a single function, which is the translate function

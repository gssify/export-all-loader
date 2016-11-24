# export-all-loader ![](https://badge.fury.io/js/export-all-loader.svg) ![issues](https://img.shields.io/github/issues/gssan/export-all-loader.svg) ![stars](https://img.shields.io/github/stars/gssan/export-all-loader.svg) ![MIT](https://img.shields.io/badge/license-MIT-blue.svg)
> Babel preloader for Webpack 

Transforms your `export * from 'xxx'` to `export {...}` which can avoid `Object.defineProperty` in IE8.

## Installation
```bash
$ npm install export-all-loader
```

## Quick Start
**webpack config:**
```js
module.exports = {
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                loader: 'export-all'
            }
        ]
    }
}
```

## Examples
**Input:**
```js
export * from 'a.js';
export * from 'b.js';
```
**Output:**
```js
import {a1, a2} from 'a.js';
import {b1, b2} from 'b.js';

export {a1, a2, b1, b2}
```

## Problems
* Not support `export default`
* Cannot use with `babel-plugin-module-resolver`

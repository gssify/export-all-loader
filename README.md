# export-wildcard-loader
可以将 `export *` 转换成普通的 `export {}` 的 webpack loader

## 使用场景
- 使用 `webpack`、`babel`
- 需要支持 IE8
- 代码中 `export * from 'xx.js'`

## 转换原理
`loader` 会自动提取依赖
input:
```js
export * from 'A.js';
export * from 'B.js';
```
output:
```js
import {A1, A2} from 'A.js';
import {B1, B2} from 'B.js';
export {A1, A2, B1, B2}
```

## 使用方法
webpack.config.js
```js
module.exports = {
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'export-wildcard'
            }
        ]
    }
}
```

## TODO
[] 支持 export default 模块提取

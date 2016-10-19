/*!
 * export-wildcard-loader <https://github.com/gssan/export-wildcard-loader>
 *
 * Copyright (c) 2016-2017, gssan.
 * Licensed under the MIT license.
 */

'use strict';

var loaderUtils = require('loader-utils');
var readFile = require('read-file');
var path = require('path');

module.exports = function(source) {
    var context = this;
    var rootURL = this.options.context;
    var callback = this.async();
    var _deps = [];

    this.cacheable && this.cacheable();

    /**
     * 获取依赖模块的URL
     * @return {Array} URL数组集合
     */
    var getModuleImports = function(source) {
        var exportAllRegexp = /export\s+\*\s+from\s+('.+?\.js')/g;
        var exportURLArray = source.match(exportAllRegexp);

        return exportURLArray.map(function(item) {
            return {url: item.split('\'')[1]};
        });
    }

    /**
     * 检查所有文件是否load完毕
     * @return {Boolean} 是否完毕
     */
    var checkLoaded = function() {
        var loaded = true;
        _deps.forEach(function(dep) {
            if (!dep.load) {
                loaded = false;
            }
        });
        if (loaded) doLoaed();
        return loaded;
    }

    /**
     * 所有模块文件加载完毕后
     */
    var doLoaed = function() {
        var result;
        var exportDeps = [];
        var exportSomeRegexp = /export\s+\*(\s+from\s+'(.+?\.js)')/g;

        result = source.replace(exportSomeRegexp, function(macth, p1, key) {
            var currentDep = _deps.find(function(dep) {
                return dep.url === key;
            })
            if (currentDep) {
                exportDeps = exportDeps.concat(currentDep.list);
                return 'import' + ' {'+currentDep.list.join(',')+'} ' + p1;
            } else {
                return match;
            }
        });

        result += '\nexport {'+ exportDeps.join(', ') +'};'

        callback(null, result);
    }

    /**
     * export * 转换工具
     * @return {String}
     */
    var transfromExportAllFrom = function(source) {
        // 分析app.js的依赖模块
        _deps = getModuleImports(source);
        _deps.forEach(function(dep) {
            // 读取依赖文件
            readFile(path.resolve(rootURL, dep.url), 'utf-8', function(err, body) {
                var exportVars = /\s*export\s+\{(.+?)\}\s*/g.exec(body);

                if (exportVars.length > 1) {
                    dep.list = exportVars[1].split(',').map(function(item) {
                        return item.trim();
                    });
                } else {
                    dep.list = [];
                }

                dep.load = true;
                checkLoaded();
            });
        });
    }

    transfromExportAllFrom(source);
};

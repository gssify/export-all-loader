/*!
 * export-wildcard-loader <https://github.com/gssan/export-wildcard-loader>
 *
 * Copyright (c) 2016-2017, gssan.
 * Licensed under the MIT license.
 */

'use strict';

var loaderUtils = require('loader-utils');
var readFile = require('read-file');
var findModule = require('find-module');
var stripJS = require('strip-comment').js;

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
        var exportAllRegexp = /export\s+\*\s+from\s+('|").+?\1/g;
        // 需要删除注释后才能提取依赖导入
        var exportURLArray = stripJS(source).match(exportAllRegexp);

        return exportURLArray.map(function(item) {
            return {url: item.split(/['|"]/)[1]};
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
     * 模块解析完毕后，替换入库文件
     */
    var doLoaed = function() {
        var result;
        var exportDeps = [];
        var exportSomeRegexp = /export\s+\*\s+from\s+("|')(.+?)\1/g;

        result = stripJS(source).replace(exportSomeRegexp, function() {
            var key = arguments[2];
            var currentDep = _deps.find(function(dep) {
                return dep.url === key;
            });

            if (currentDep) {
                exportDeps = exportDeps.concat(currentDep.list);
                return 'import' + ' { '+currentDep.list.join(', ')+' } from \'' + currentDep.url + '\'';
            } else {
                return match;
            }
        });

        result += '\nexport {'+ exportDeps.join(', ') +'};'

        callback(null, source);
    }

    /**
     * export * 转换工具
     * @return {String}
     */
    var transfromExportAllFrom = function(source) {
        // 分析app.js的依赖模块
        _deps = getModuleImports(source);
        _deps.forEach(function(dep) {
            // 处理 url
            var _url = '';
            if (dep.url.indexOf('./') < 0) {
                // export * from 'utils'
                _url = './node_modules/' + dep.url + '/index.js';
            } else {
                if (dep.url.test(/\.js$/g)) {
                    _url = dep.url;
                } else {
                    _url = dep.url + '/js';
                }
            }

            // 寻找模块
            findModule(dep.url, {
                dirname: rootURL
            }, function(err, filename) {
                if (err) {
                    return;
                }

                // 读取文件
                readFile(filename, 'utf-8', function(err, body) {
                    if (err) return;

                    var exportVars = /\s*export\s+\{(.+?)\}\s*/g.exec(stripJS(body));
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
        });
    }

    transfromExportAllFrom(source);
};

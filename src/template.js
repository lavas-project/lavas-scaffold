/**
 * @file 操作 template
 * @author mj(zoumiaojiang@gmail.com)
 */


import conf from './config';
import gData from './data';

import git from 'simple-git';
import glob from 'glob';
import etpl from 'etpl';
import fs from 'fs-extra';
import path from 'path';

import archiver from 'archiver';
import childProcess from 'child_process';

/**
 * 从git上downloa代码下来
 *
 * @param  {string} repo       git repo
 * @param  {string} targetPath 存储的目标目录
 * @return {Promise}           promise 对象
 */
function downloadFromGit(repo, targetPath) {
    return new Promise((resolve, reject) => {
        try {
            // 如果当前文件系统有 download 的缓存，就不立即下载了。我们走后台默默更新就好了。
            if (fs.existsSync(targetPath)) {
                const downloadProcessPath = path.resolve(__dirname, 'download.js');
                resolve(targetPath);

                childProcess.exec(`node ${downloadProcessPath}`, (err, output) => {
                    if (!err) {
                        console.log(output);
                    }
                });

            }
            else {
                git().clone(repo, targetPath, {}, () => {
                    resolve(targetPath);
                });
            }
        }
        catch (e) {
            reject('模版下载失败');
        }
    });
}


/**
 * 渲染 template 里面的所有文件
 *
 * @param  {Object} fields    收集的用户输入字段
 * @param  {string} ltd       临时文件夹存储路径
 * @param  {Object} template  template 对象
 * @param  {boolean} isStream  导出的是否为流
 * @return {Promise}          渲染 promise
 */
function renderTemplate(fields, ltd, template, isStream) {

    const dirPath = fields.dirPath;

    let etplCompile = new etpl.Engine(template.etpl || {
        commandOpen: '{%',
        commandClose: '%}',
        variableOpen: '*__',
        variableClose: '__*'
    });

    return new Promise((resolve, reject) => {
        glob(
            '**/*',
            {
                cwd: ltd,
                ignore: [
                    'node_modules',
                    '**/*.tmp', '**/*.log',
                    '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.bmp', '**/*.gif', '**/*.ico',
                    '**/*.svg', '**/*.woff', '**/*.ttf'
                ].concat(template.renderIgnores || [])
            },
            (err, files) => {
                files.forEach(file => {
                    const filePath = path.resolve(ltd, file);
                    if (fs.statSync(filePath).isFile()) {
                        const fileCon = fs.readFileSync(filePath, 'utf8');

                        // 这里可以直接通过外界配置的规则，重新计算出一份数据，只要和 template 里面的字段对应上就好了。
                        const extDataTpls = template.extData || {};
                        const extData = {};

                        Object.keys(extDataTpls).forEach(key => {
                            extData[key] = etplCompile.compile('' + extDataTpls[key])(fields);
                        });

                        const renderData = Object.assign({}, fields, extData);

                        const afterCon = etplCompile.compile(fileCon)(renderData);
                        fs.writeFileSync(filePath, afterCon);
                    }
                });

                if (isStream) {
                    const archive = archiver('zip', {
                        zlib: {level: 9} // Sets the compression level.
                    });
                    const tmpZipPath = path.resolve(ltd, 'tmp.zip');
                    const output = fs.createWriteStream(tmpZipPath);
                    archive.pipe(output);
                    archive.directory(ltd, fields.name);
                    archive.finalize().on('finish', () => {
                        const zipCon = fs.createReadStream(tmpZipPath);
                        zipCon.on('data', data => {
                            resolve(data);
                            // console.log('render time: ', Date.now());
                        });
                    });
                }
                else {
                    fs.copySync(ltd, dirPath);
                    resolve(dirPath);
                }
            }
        );
    });
}


/* eslint-disable fecs-use-method-definition */
export default {

    /**
     * 获取云端所有的模版数据
     *
     * @return {Array<Object>} 模版 list，结构化的数据
     */
    getTemplates: async function () {
        let data = await gData();
        let templates = data.templates;
        return templates;
    },


    /**
     * 导出某一个模版
     *
     * @param {Object} fields  导出模版所需字段
     * @param {boolean} isStream  导出的是否为流
     * @return {any}              导出的结果
     */
    exportsTemplate: async function (fields, isStream) {

        let data = await gData();
        let fwobj = {};

        // 这里说明一下， 没办法做到完全解耦， 必须传入 fields.framework 字段，也就是必须得指定一个 framework
        // 在 GLOBAL_CONF_URL 对应的必须得有 framework 这个 property，否则 run 不起来
        for (let framework of data.templates) {
            if (framework.value === fields.framework) {
                fwobj = framework;
            }
        }

        const gitRepo = fwobj.git;
        const ltd = path.resolve(conf.LOCAL_TEMPLATES_DIR, `${Date.now()}`);
        const tltd = path.resolve(conf.LOCAL_TEMPLATES_DIR, fields.framework, 'templates');

        try {
            if (fs.existsSync(ltd)) {
                fs.removeSync(ltd);
            }
            if (!fs.existsSync(tltd)) {
                fs.mkdirsSync(tltd);
            }

            fs.mkdirsSync(ltd);
            await downloadFromGit(gitRepo, tltd);
            fs.copySync(tltd, ltd);

            // 把指定的文件和文件夹都删掉
            (fwobj.exportsIgnores || [
                '.git',
                'docs'
            ]).forEach(fileOrDir => {
                const filePath = path.resolve(ltd, fileOrDir);
                if (fs.existsSync(filePath)) {
                    fs.removeSync(filePath);
                }
            });

            const renderResult = await renderTemplate(fields, ltd, fwobj, isStream);
            fs.removeSync(ltd);

            return renderResult;
        }
        catch (e) {
            throw new Error('下载模版失败，请检查当前网络环境是否正常');
        }

    }
};


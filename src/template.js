/**
 * @file 操作 template
 * @author mj(zoumiaojiang@gmail.com)
 */


import conf from './config';
import gData from './data';
import store from './store';

import git from 'simple-git';
import glob from 'glob';
import etpl from 'etpl';

import fs from 'fs-extra';
import path from 'path';

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
            git().clone(repo, targetPath, {}, () => {
                resolve(targetPath);
            });
        }
        catch (e) {
            reject('模版下载失败');
        }
    });
}



/**
 * 渲染 template 里面的所有文件
 *
 * @param  {Object} fields 收集的用户输入字段
 * @return {Promise}       渲染 promise
 */
function renderTemplate(fields) {
    const dirPath = fields.dirPath;
    const ltd = conf.LOCAL_TEMPLATES_DIR;
    const data = store.get('data') || {};

    return new Promise((resolve, reject) => {
        glob(
            '**/*',
            {
                cwd: ltd,
                ignore: [
                    'node_modules',
                    '*.tmp', '*.log', '*.png', '*.jpg', '*.jpeg',
                    '*.svg', '*.woff', '*.ttf', '*.bmp', '.gif'
                ].concat(data.ignores || [])
            },
            (err, files) => {
                files.forEach(file => {
                    const filePath = path.resolve(ltd, file);
                    const fileCon = fs.readFileSync(filePath, 'utf8');

                    // 这里可以直接通过外界配置的规则，重新计算出一份数据，只要和 template 里面的字段对应上就好了。
                    const dfDataTpls = data.defaultData || {};
                    const dfData = {};

                    Object.keys(dfDataTpls).forEach(key => {
                        dfData[key] = etpl.render(dfDataTpls[key], fields);
                    });

                    let renderData = Object.assign({}, fields, dfData);

                    const afterCon = etpl.render(fileCon, renderData);
                    fs.writeFileSync(filePath, afterCon);

                });

                fs.copySync(conf.LOCAL_TEMPLATES_DIR, dirPath);
                resolve();
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
     * @param  {Object} fields 导出模版所需字段
     */
    exportTemplate: async function (fields) {

        let data = await gData();
        let fwobj = {};

        for (let framework of data.templates) {
            if (framework.value === fields.framework) {
                fwobj = framework;
            }
        }

        const gitRepo = fwobj.git;
        const ltd = conf.LOCAL_TEMPLATES_DIR;

        try {
            if (fs.existsSync(ltd)) {
                fs.removeSync(ltd);
            }
            await downloadFromGit(gitRepo, ltd);

            // 把 .git 文件夹删掉
            fs.removeSync(path.resolve(ltd, '.git'));
            await renderTemplate(fields);
        }
        catch (e) {
            throw new Error('下载模版失败，请检查当前网络环境是否正常');
        }

    }
};


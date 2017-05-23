/**
 * @file bpwa 入口
 * @author mj(zoumiaojiang@gmail.com)
 */


import path from 'path';

import bpwaSchema from './src/schema';
import bpwaProject from './src/project';
import bpwaTemplate from './src/template';




/* eslint-disable fecs-use-method-definition */
export default {

    /**
     * 导出 pwa 脚手架工程
     *
     * @param  {Object} fields 参数
     * @return {Promise}       resolve 工程名
     */
    exportProject: async function (fields) {

        const projName = fields.name || 'pwa-project';
        const targetDir = path.resolve(fields.dirPath || '/tmp', projName);

        fields.dirPath = targetDir;
        fields.name = projName;

        const errors = await bpwaProject.exports(fields);

        if (errors) {
            return {errors};
        }

        return projName;
    },


    /**
     * 得到 schema
     *
     * @return {Promise} resolve schema
     */
    getSchema: async function () {
        let schema = await bpwaSchema.getSchema();
        return schema;
    },


    /**
     * 得到当前支持的所有的 framework
     *
     * @return {Promise} resolve frameworks
     */
    getTemplates: async function () {
        let templates = await bpwaTemplate.getTemplates();
        return templates;
    }

};

/**
 * @file lava-scaffold 入口
 * @author mj(zoumiaojiang@gmail.com)
 */


const path = require('path');

const lavasScaffoldSchema = require('./lib/schema');
const lavasScaffoldProject = require('./lib/project');
const lavasScaffoldTemplate = require('./lib/template');
const utils = require('./lib/utils');


/**
 * 获取导出的keyong fields
 *
 * @param  {Object} fields  传入的 fields
 * @return {Object}         输出的 fields
 */
let getFields = async function (fields) {

    let schema = await lavasScaffoldSchema.getSchema();
    let defaultFields = {};

    Object.keys(schema.properties).forEach(key => {
        defaultFields[key] = schema.properties[key].default;
    });

    fields = Object.assign({}, defaultFields, fields);
    fields.name = fields.name || 'pwa-project';
    fields.dirPath = path.resolve(process.cwd(), fields.dirPath || '', fields.name);

    return fields;
};


/* eslint-disable fecs-use-method-definition */
module.exports = {


    /**
     * 导出 pwa 脚手架工程
     *
     * @param  {Object} fields 参数
     * @param  {Object} isStream 是否需要取得流
     * @return {Promise}       resolve 工程所在路径/工程的 zip buffer
     */
    exportProject: async function (fields, isStream) {

        if (!utils.hasCommand('git')) {
            return {
                code: 'no command',
                message: '当前环境不能使用 git 命令'
            };
        }

        fields = await getFields(fields);

        let {err, ret} = await lavasScaffoldProject.exports(fields, isStream);

        if (err) {
            return err;
        }

        return ret;
    },


    /**
     * 得到 schema
     *
     * @return {Promise} resolve schema
     */
    getSchema: async function () {

        let schema = await lavasScaffoldSchema.getSchema();

        return schema;
    },


    /**
     * 得到当前支持的所有的 framework
     *
     * @return {Promise} resolve frameworks
     */
    getTemplates: async function () {

        let templates = await lavasScaffoldTemplate.getTemplates();

        return templates;
    }
};

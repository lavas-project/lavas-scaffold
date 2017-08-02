/**
 * @file lava-scaffold 入口
 * @author mj(zoumiaojiang@gmail.com)
 */

const path = require('path');

const _ = require('lodash');

const lavasSchema = require('./lib/schema');
const lavasTemplate = require('./lib/template');

/**
 * 获取导出的所有的 fields （包含 default 参数）
 *
 * @param  {Object} fields  传入的 fields
 * @param  {Obejct} conf    模版的配置
 * @return {Object}         输出的 fields
 */
async function extendsDefaultFields(fields = {}, conf = {}) {

    let schema = await lavasSchema.getSchema(conf);
    let defaultFields = {};

    Object.keys(schema).forEach(key => {
        defaultFields[key] = schema[key].default;
    });

    fields = _.merge({}, defaultFields, fields);
    fields.name = fields.name || 'lavas-pwa';
    fields.dirPath = path.resolve(process.cwd(), fields.dirPath || '', fields.name);

    return fields;
}

/**
 * 获取元 schema (涉及模版下载的 schema)
 *
 * @return {Promise<*>}   Meta Schema
 */
exports.getMetaSchema = async function () {
    return await lavasSchema.getMetaSchema();
};

/**
 * 获取 schema (涉及模版渲染的 schema)
 *
 * @param {Object} conf 模版自己的配置
 * @return {Promise<*>}   Schema
 */
exports.getSchema = async function (conf = {}) {
    return await lavasSchema.getSchema(conf);
};

/**
 * 下载模版
 *
 * @param {Object} params 导出参数
 * @return {*} 下载的临时路径 或者 报错对象
 */
exports.downloadTemplate = async function (params = {}) {
    params = await extendsDefaultFields(params);

    return await lavasTemplate.download(params);
};

/**
 * 渲染工程
 *
 * @param {Object} params 导出参数
 * @param {Object} conf 模版的配置
 * @return {Promise<*>}   导出的结果
 */
exports.renderTemplate = async function (params = {}, conf = {}) {
    params = await extendsDefaultFields(params, conf);

    return await lavasTemplate.render(params);
};

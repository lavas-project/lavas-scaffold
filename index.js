/**
 * @file lavas scaffold entry
 * @author mj(zoumiaojiang@gmail.com)
 */

const path = require('path');

const _ = require('lodash');

const lavasSchema = require('./lib/schema');
const lavasTemplate = require('./lib/template');
const store = require('./lib/store');

/**
 * 获取导出的所有的 fields （包含 default 参数）
 *
 * @param  {Object} fields  传入的 fields
 * @param  {Obejct} templateConf    模版的配置
 * @return {Object}         输出的 fields
 */
async function extendsDefaultFields(fields = {}, templateConf = {}) {
    let defaultFields = {};
    let schema = store.get('schema') || await lavasSchema.getSchema(templateConf);

    Object.keys(schema).forEach(key => (defaultFields[key] = schema[key].default));

    /* eslint-disable fecs-use-computed-property */
    defaultFields.name = fields.name || 'lavas-pwa';
    defaultFields.dirPath = path.resolve(process.cwd(), fields.dirPath || '', defaultFields.name);

    return _.merge({}, defaultFields, fields);
}

/**
 * 获取元 Schema - 涉及模版下载的 Schema
 *
 * @return {Promise<*>}   Meta Schema
 */
exports.getMetaSchema = async function () {
    let metaSchema = store.get('metaSchema');

    if (!metaSchema) {
        metaSchema = await lavasSchema.getMetaSchema();
    }
    return metaSchema;
};

/**
 * 获取 Schema - 涉及模版渲染的 Schema
 *
 * @param {Object} templateConf 模版自己的配置
 * @return {Promise<*>}   Schema
 */
exports.getSchema = async function (templateConf = {}) {
    let schema = store.get('schema');
    if (!schema) {
        schema = await lavasSchema.getSchema(templateConf);
    }
    return schema;
};

/**
 * 通过指定的 meta 参数下载模版，下载成功后返回模板的 Schema 信息
 *
 * @param {Object} params 导出参数
 * @return {*} 下载的临时路径 或者 报错对象
 */
exports.download = async function (params = {}) {
    params = await extendsDefaultFields(params);

    return await lavasTemplate.download(params);
};

/**
 * 通过指定的参数渲染下载成功的模板
 *
 * @param {Object} params 导出参数
 * @param {Object} templateConf 模版的配置
 * @return {Promise<*>}   导出的结果
 */
exports.render = async function (params = {}, templateConf = {}) {
    params = await extendsDefaultFields(params, templateConf);
    return await lavasTemplate.render(params);
};


if (process.env.NODE_ENV === 'development') {
    console.log('you are in development');
}

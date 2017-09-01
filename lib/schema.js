/**
 * @file schema modules
 * @author mj(zoumiaojiang@gmail.com)
 */

const getMeta = require('./getMeta');
const store = require('./store');

const _ = require('lodash');

/**
 * 把约定的 json config 内容解析成 schema
 *
 * @param {Object}  conf 按照约定格式的配置 json 文件
 * @return {Object} schema
 */
function parseConfToSchema(conf = {}) {
    let properties = conf.schema || {};

    Object.keys(properties).forEach(key => {
        let item = properties[key];

        if (item.type === 'list') {
            if (item.link && !item.dependence) {
                properties[key].list = conf[item.link];
            }
            else if (item.dependence) {
                properties[item.dependence].list.forEach(depItem => {
                    if (depItem.value === conf.defaults[item.dependence]) {
                        properties[key].list = depItem.subList
                            ? (depItem.subList[key] || [])
                            : []
                        ;
                    }
                });
            }
        }
    });

    return properties;
}

/**
 * 把约定的 json config 内容解析成 json schema
 *
 * @param {Object}  conf 按照约定格式的配置 json 文件
 * @return {Object} json schema
 */
function parseConfToJsonSchema(conf = {}) {
    let schemas = conf.schema || {};
    let properties = {};
    let required = [];
    let dependence = {};

    Object.keys(schemas).forEach(key => {
        let item = schemas[key];

        if (!item.disable) {
            properties[key] = {
                type: item.jsonType || item.type,
                description: item.description
            };

            if (item.regExp) {
                properties[key].pattern = item.regExp;
            }

            if (item.required) {
                required.push(key);
            }
        }
    });

    return {
        type: 'object',
        description: 'lavas scaffold json schema',
        properties,
        required,
        dependence
    };
}

/**
 * 获取元 schema
 *
 * @return {Object} 元 schema
 */
exports.getMetaSchema = async function () {
    let meta = await getMeta();
    let metaSchema = parseConfToSchema(meta);

    store.set('metaSchema', metaSchema);

    return metaSchema;
};

/**
 * 获取 meta JSON Schema, 用于验证 json 表单
 *
 * @param {Object} templateConf 每个模版的 config
 * @return {Object} 返回的 JSON Schema
 */
exports.getMetaJsonSchema = async function () {
    let meta = await getMeta();
    let metaJsonSchema = parseConfToJsonSchema(meta);

    store.set('metaJsonSchema', metaJsonSchema);

    return metaJsonSchema;
};

/**
 * 获取 JSON Schema, 用于验证 json 表单
 *
 * @param {Object} templateConf 每个模版的 config
 * @return {Object} 返回的 JSON Schema
 */
exports.getSchema = async function (templateConf = {}) {
    let originSchema = parseConfToSchema(templateConf);
    let metaSchema = store.get('metaSchema') || await this.getMetaSchema();
    let schema = _.merge({}, metaSchema, originSchema);

    store.set('schema', schema);

    return schema;
};

/**
 * 获取 JSON schema, 用于验证 json 表单
 *
 * @param {Object} templateConf 每个模版的 config
 * @return {Object} 返回的 JSON Schema
 */
exports.getJsonSchema = async function (templateConf = {}) {
    let originJsonSchema = parseConfToJsonSchema(templateConf);
    let metaJsonSchema = store.get('metaJsonSchema') || await this.getMetaJsonSchema();
    let jsonSchema = _.merge({}, metaJsonSchema, originJsonSchema);

    store.set('jsonSchema', jsonSchema);

    return jsonSchema;
};

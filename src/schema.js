/**
 * @file schema
 * @author mj(zoumiaojiang@gmail.com)
 */


import gData from './data';


/* eslint-disable fecs-use-method-definition */
export default {

    /**
     * 获取和初始化 pwa 项目相关的 fields
     *
     * @return {Object} 返回的 fields
     */
    getSchema: async function () {

        let data = await gData();
        let schemas = data.schemas;
        let properties = {};

        Object.keys(schemas).forEach(key => {
            if (!schemas[key].disable) {
                properties[key] = schemas[key];
            }
        });

        const keys = Object.keys(properties);

        for (let key of keys) {
            const item = properties[key];

            if (item.type === 'list') {

                if (item.link && !item.dependence) {
                    properties[key].list = data[item.link];
                }
            }
        }

        return {properties};
    },


    /**
     * 获取 json schema, 用于验证 json 表单
     *
     * @return {Object} 返回的json schema
     */
    getJsonSchema: async function () {
        let data = await gData();
        let schemas = data.schemas;
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

};

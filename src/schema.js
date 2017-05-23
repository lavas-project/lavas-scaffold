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
        let properties = data.properties;

        const keys = Object.keys(properties);

        for (let key of keys) {
            const item = properties[key];

            // @todo: 从真实的template项目和 gData 中拿数据
            if (item.type === 'list') {

                if (item.link && !item.dependence) {
                    properties[key].list = data[item.link];
                }

                if (item.dependence) {
                    properties[key].list = [];
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

        return data.jsonSchema;
    }

};

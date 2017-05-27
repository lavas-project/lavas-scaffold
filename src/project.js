/**
 * @file 操作 project
 * @author mj(zoumiaojiang@gmail.com)
 */


import bpwaSchema from './schema';
import bpwaTemplate from './template';
import log from './log';
import Ajv from 'ajv';


/**
 * 验证参数
 *
 * @param  {Object} fields 请求的参数
 * @return {any}           验证结果
 */
async function validate(fields) {
    let jsonSchema = await bpwaSchema.getJsonSchema();

    let ajv = new Ajv({allErrors: true});
    let validate = ajv.compile(jsonSchema);
    let valid = validate(fields);

    if (!valid) {
        validate.errors.forEach(error => {
            log.error(error.message);
        });
        return validate.errors;
    }
    return false;
}


/* eslint-disable fecs-use-method-definition */
export default {

   /**
    * 导出 pwa 项目
    *
    * @param  {Object} fields  导出相关参数
    * @param  {Object} isStream 是否需要取得流
    * @return {any} error
    */
    exports: async function (fields, isStream) {

        const err = await validate(fields);
        let ret = null;
        if (!err) {
            ret = await bpwaTemplate.exportsTemplate(fields, isStream);
        }

        return {err, ret};
    }
};


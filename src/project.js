/**
 * @file 操作 project
 * @author mj(zoumiaojiang@gmail.com)
 */


import bpwaSchema  from './schema';
import bpwaTemplate from './template';
import log from './log';
import Ajv from 'ajv';


/* eslint-disable fecs-use-method-definition */
export default {

   /**
    * 导出 pwa 项目
    *
    * @param  {Object} fields  导出相关参数
    * @return {any} error
    */
    exports: async function (fields) {

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

        await bpwaTemplate.exportTemplate(fields);
    }
};


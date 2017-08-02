/**
 * @file 功能测试入口
 * @author mj(zoumiaojiang@gmail.com)
 */

const lavas = require('../../index');

const setupLavas = async function () {

    let metaSchema = await lavas.getMetaSchema();

    console.log(metaSchema);

    let params = {
        template: 'Basic'
    };

    let templateConf = await lavas.downloadTemplate(params);

    console.log(templateConf);

    let params1 = {
        name: 'test-project',
        author: 'someonexxx',
        email: 'someone@xxx.com',
        isStream: true
    };

    let streamDir = await lavas.renderTemplate(params1, templateConf);

    console.log(streamDir);
};

setupLavas();

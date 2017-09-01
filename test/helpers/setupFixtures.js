/**
 * @file 功能测试入口
 * @author mj(zoumiaojiang@gmail.com)
 */

/* eslint-disable fecs-prefer-async-await */
const lavas = require('../../index');

const setupLavas = async function () {

    let metaSchema = await lavas.getMetaSchema();

    console.log('================ META CONFIG ===================');
    console.log(metaSchema);

    // 选择的 mata 选项 [framework | template]
    let metaParams = {
        template: 'Basic'
    };

    let templateSchema = await lavas.download(metaParams, metaSchema);

    console.log('================ TEMPLATE CONFIG =================');
    console.log(templateSchema);

    let renderParams = {
        name: 'test-project',
        author: 'someonexxx',
        email: 'someone@xxx.com',
        isStream: true
    };

    let streamDir = await lavas.render(renderParams, templateSchema);
    console.log('================ EXPORT STREAM PROJECT ===============');
    console.log(streamDir);
};

setupLavas();

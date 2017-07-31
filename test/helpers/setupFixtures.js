/**
 * @file 功能测试入口
 * @author mj(zoumiaojiang@gmail.com)
 */

const lavas = require('../../index');

const setupLavas = async function () {

    let streamRet = await lavas.exportProject({
        name: 'test-project',
        author: 'someone',
        email: 'someone@somecompany.com'
    }, true);

    console.log(streamRet);
};

setupLavas();

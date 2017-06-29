/**
 * @file 功能测试入口
 * @author mj(zoumiaojiang@gmail.com)
 */

const lavas = require('../../index');
// const path = require('path');

async function setupLavas() {
    // const schema = await lavas.getSchema();

    // console.log(schema.properties);
    // console.log('start time: ', Date.now());
    let ret = await lavas.exportProject({
        name: 'xxxx',
        author: 'zoumiaojiang',
        email: 'zoumiaojiang@gmail.com'
    }, true);

    console.log(ret);
}



setupLavas();


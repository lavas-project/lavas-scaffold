/**
 * @file 功能测试入口
 * @author mj(zoumiaojiang@gmail.com)
 */


import bpwa from '../../index';
import path from 'path';


async function setupBpwa() {
    // const schema = await bpwa.getSchema();

    // console.log(schema.properties);
    // console.log('start time: ', Date.now());
    const ret = await bpwa.exportProject({
        name: 'xxxx',
        dirPath: path.resolve(__dirname, '..', '..', '..'),
        author: 'zoumiaojiang',
        email: 'zoumiaojiang@gmail.com'
    }, true);

    console.log(ret);
}



setupBpwa();


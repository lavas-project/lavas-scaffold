/**
 * @file 功能测试入口
 * @author mj(zoumiaojiang@gmail.com)
 */


import lavas from '../../index';
import path from 'path';


async function setupLavas() {
    // const schema = await lavas.getSchema();

    // console.log(schema.properties);
    // console.log('start time: ', Date.now());
    const ret = await lavas.exportProject({
        name: 'xxxx',
        dirPath: path.resolve(__dirname, '..', '..', '..'),
        author: 'zoumiaojiang',
        email: 'zoumiaojiang@gmail.com'
    }, true);

    console.log(ret);
}



setupLavas();


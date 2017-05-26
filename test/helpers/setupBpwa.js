/**
 * @file 功能测试入口
 * @author mj(zoumiaojiang@gmail.com)
 */


import bpwa from '../../index';
import path from 'path';


async function setupBpwa() {
    // const schema = await bpwa.getSchema();

    // console.log(schema.properties);

    await bpwa.exportProject();

    // const ret = await bpwa.exportProject({
    //     name: 'xxxx',
    //     dirPath: path.resolve(__dirname, '..', '..', '..'),
    //     isSsr: false,
    //     appShell: 'aa',
    //     framework: 'vue',
    //     author: 'zoumiaojiang',
    //     email: 'zoumiaojiang@gmail.com'
    // });

    //  console.log(ret);
//
    // bpwa.checkUpdate();
}



setupBpwa();


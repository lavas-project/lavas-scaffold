/**
 * @file 功能测试入口
 * @author mj(zoumiaojiang@gmail.com)
 */


import bpwa from '../../index';


async function setupBpwa() {
    // const schema = await bpwa.getSchema();

    // console.log(schema);


    const ret = await bpwa.exportProject({
        name: 'xxxx',
        dirPath: __dirname,
        isSsr: false,
        appShell: 'aa',
        framework: 'vue'
    });

    console.log(ret);
//
    // bpwa.checkUpdate();
}



setupBpwa();


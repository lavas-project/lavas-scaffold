/**
 * @file 糊一个存储器
 * @author mj(zoumiaojiang@gmail.com)
 */

import requestP from 'request-promise';

import store from './store';
import conf from './config';


/**
 * 请求全局的配置json
 *
 * @return {Object}   json 数据
 */
export default (async function () {

    let data = store.get('data');

    // 如果 store 中已经存在了，那 2s 后我们再去尝试更新一下是不是有最新的数据
    if (data) {

        let timer = setTimeout(() => {
            requestP.get({
                uri: conf.GLOBAL_CONF_URL,
                json: true
            }).then(json => {
                store.set('data', json);
                clearTimeout(timer);
            });
        }, 2000);

        return data;
    }

    // 如果 store 里面没有, 我们马上就获取一份最新的数据
    data = await requestP.get({
        uri: conf.GLOBAL_CONF_URL,
        json: true
    });

    store.set('data', data);

    return data;
});

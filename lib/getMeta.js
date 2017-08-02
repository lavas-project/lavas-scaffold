/**
 * @file 糊一个存储器
 * @author mj(zoumiaojiang@gmail.com)
 */

const requestP = require('request-promise');

const store = require('./store');
const conf = require('./config');

const confUrl = conf.GLOBAL_CONF_URL[process.env.NODE_ENV === 'development' ? 'development' : 'production'];

/**
 * 请求全局的配置json
 *
 * @return {Object}   json 数据
 */
module.exports = async function () {
    let data = store.get('data');

    // 如果 store 中已经存在了，那 2s 后我们再去尝试更新一下是不是有最新的数据
    if (data) {
        let timer = setTimeout(() => {
            requestP.get({
                uri: confUrl,
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
        uri: confUrl,
        json: true
    });

    store.set('data', data);

    return data;
};

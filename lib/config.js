/**
 * @file lavas Scaffold 相关配置
 * @author mj(zoumiaojiang@gmail.com)
 */

const path = require('path');

const utils = require('./utils');

/* eslint-disable fecs-use-method-definition */
module.exports = {

    /**
     * 本地模版存放路径
     *
     * @type {String}
     */
    LOCAL_TEMPLATES_DIR: path.resolve(utils.getHome(), 'tmp'),

    /**
     * git zip 包正则
     *
     * @type {RegExp}
     */
    GIT_ZIP_REGEX: /^(?:https?\:\/\/)?(?:github|gitlab)\.[^/]+\/[^/]+\/([^/]+)\/.+(?:zip|tar\.gz)/,

    /**
     * 全局的配置文件地址
     *
     * @type {String}
     */
    GLOBAL_CONF_URL: 'https://bos.nj.bpc.baidu.com/mms-res/lavas-scaffold/config.json',

    /**
     * render common data
     *
     * @type {Object}
     */
    COMMON_DATA: {
        year: (new Date()).getFullYear(),
        time: Date.now()
    }
};

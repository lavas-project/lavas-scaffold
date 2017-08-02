/**
 * @file lavas scaffold 工具包
 * @author mj(zoumiaojiang@gmail.com)
 */

const shelljs = require('shelljs');

const fs = require('fs-extra');
const os = require('os');
const path = require('path');

/**
 * 系统是否存在某条命令
 *
 * @param  {string}  commandName 命令名
 * @return {boolean}             判断结果
 */
exports.hasCommand = function (commandName) {
    return shelljs.which(commandName);
};

/**
 * 获取项目根目录
 *
 * @return {string} 目录 Path
 */
exports.getHome = function () {
    let dir = process.env[
        os.platform() === 'win32'
            ? 'APPDATA'
            : 'HOME'
    ] + path.sep + '.lavas-project';

    // 如果这个目录不存在，则创建这个目录
    !fs.existsSync(dir) && fs.mkdirSync(dir);

    return dir;
};


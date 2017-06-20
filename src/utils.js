/**
 * @file lavas scaffold 工具包
 * @author mj(zoumiaojiang@gmail.com)
 */

import shelljs from 'shelljs';

/* eslint-disable fecs-use-method-definition */
export default {
    hasCommand: function (commandName) {
        return shelljs.which(commandName);
    }
};

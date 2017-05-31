/**
 * @file 单独执行下载任务的 process
 * @author mj(zoumiaojiang@gmail.com)
 */

var git = require('simple-git');
var path = require('path');
var fs = require('fs-extra');
var requestP = require('request-promise');


var LOCAL_TEMPLATES_DIR = path.resolve(__dirname, '../tmp');


function downloadFromGit() {
    requestP.get({
        uri: 'https://bos.nj.bpc.baidu.com/mms-res/pwa/config.json',
        json: true
    }).then(
        function (data) {
            data.templates.forEach(
                function (item) {
                    var framework = item.value;
                    var repo = item.git;
                    var dest = path.resolve(LOCAL_TEMPLATES_DIR, framework, 'templates');
                    var tmpTarget = path.resolve(dest, '..', '__tmp');

                    if (fs.existsSync(tmpTarget)) {
                        fs.removeSync(tmpTarget);
                    }

                    git().clone(repo, tmpTarget, {}, function () {
                        fs.removeSync(dest);
                        fs.copySync(tmpTarget, dest);
                        fs.removeSync(tmpTarget);
                        // console.log('node time: ', Date.now());
                    });
                }
            );
        }
    );
}


downloadFromGit();

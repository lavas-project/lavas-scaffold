/**
 * @file utils unit test case
 * @author mj(zoumiaojiang@gmail.com)
 */

const test = require('ava');
const utils = require('../../dist/lib/utils');
const fs = require('fs-extra');
const os = require('os');

const sinon = require('sinon');


test('it should be get judge right result of command when call `utils.hasCommand()`', t => {

    let hasCmd = !!utils.hasCommand('cp');
    let noCmd = !utils.hasCommand('no_command');

    t.true(hasCmd && noCmd);
});

test('it should be get right fold when call `utils.getHome()`', async t => {
    let tmpDir = utils.getHome();
    let osPlatformStub;

    t.true(tmpDir.includes('.lavas-project'));
    t.true(fs.existsSync(tmpDir));

    fs.removeSync(tmpDir);

    t.false(fs.existsSync(tmpDir));

    tmpDir = utils.getHome();

    t.true(fs.existsSync(tmpDir));

    if (os.platform() === 'win32') {
        osPlatformStub = sinon.stub(os, 'platform').returns('unix');
    }
    else {
        osPlatformStub = sinon.stub(os, 'platform').returns('win32');
    }

    try {
        tmpDir = utils.getHome();
    }
    catch (e) {
        t.true(e.message.includes('no such file or directory, mkdir \'undefined/.lavas-project\''));
    }

    osPlatformStub.restore();
});

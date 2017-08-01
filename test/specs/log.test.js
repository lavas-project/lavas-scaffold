/**
 * @file log unit test
 * @author mj(zoumiaojiang@gmail.com)
 */
const test = require('ava');

const log = require('../../dist/lib/log');

test('it should be ok', t => {

    process.stdout.clearLine = function () {};
    process.stdout.cursorTo = function () { };

    global.LAVAS_LOG_FLAG = true;

    log.info('hello world');
    log.warn('hello world');
    log.error('hello world');
    log.trace('hello world');
    log.debug('hello world');
    log.fatal('hello world');
    log.write('%s, space %s', 'hello', 'world');
    log.raw('%s, %s', 'hello', 'world');
    log.clear();

    global.LAVAS_LOG_FLAG = false;
    log.info();

    process.stdout.clearLine = undefined;
    log.write('%s, space %s', 'hello', 'world');

    process.env.LAVAS_LOG_SILENT = '1';
    log.info('hello world');
    log.warn('hello world');
    log.error('hello world');
    log.trace('hello world');
    log.debug('hello world');
    log.fatal('hello world');
    log.write('%s, space %s', 'hello', 'world');
    log.raw('%s, %s', 'hello', 'world');
    log.clear();


    let chalk = log.chalk;

    t.true(typeof chalk === 'object');
    t.true(true);
});


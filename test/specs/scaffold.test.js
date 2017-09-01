/**
 * @file project unit test
 * @author mj(zoumiaojiang@gmail.com)
 */

/* eslint-disable fecs-prefer-async-await */
const test = require('ava');

const lavas = require('../../dist');
const store = require('../../dist/lib/store');
const getFields = require('../helpers/getFields');

const fs = require('fs-extra');
const path = require('path');

let metaSchema = {};
let schema = {};
let tData = {};
let tmpDir = path.resolve(process.cwd(), './test/tmp');

test.before('get JSON Schema and download template & render template', async t => {

    // 获取初始的元 Schema
    metaSchema = await lavas.getMetaSchema();

    // 下载一次 test
    tData = await lavas.download({
        framework: 'vue',
        template: 'Basic'
    }, metaSchema);

    // 通过下载的模板的配置信息获取渲染模板 Schema
    schema = await lavas.getSchema(tData);
});


test('it should be get right schema', async t => {
    let hasProperties = !!schema
        && (typeof schema === 'object')
        && schema.hasOwnProperty('framework');
    t.true(hasProperties);
});


test('it should be init project to readFileStream success', async t => {
    // 渲染成 fileReadStream 的 test
    // 通过获取的 Schema mock 参数
    let fields = await getFields(schema);

    // 对 mock 参数做一些特殊处理
    fields.isStream = true;
    let streamProject = await lavas.render(fields, tData);
    t.true(typeof streamProject === 'object');
});

test('it should be init project to readFileStream success too', async t => {
    // 直接渲染到本地文件系统的 test
    store.set('schema', undefined);
    store.set('metaSchema', undefined);
    store.set('metaJsonSchema', undefined);
    store.set('jsonSchema', undefined);

    // 通过获取的 Schema mock 参数
    let fields = await getFields(schema);

    // 对 mock 参数做一些特殊处理
    fields.isStream = true;
    let streamProject = await lavas.render(fields, tData);
    t.true(typeof streamProject === 'object');
});


test('it should be init project to fileSystem success', async t => {
    // 直接渲染到本地文件系统的 test
    // 通过获取的 Schema mock 参数
    let fields = await getFields(schema);

    // 对 mock 参数做一些特殊处理
    fields.dirPath = path.resolve(tmpDir, fields.name || '');
    !fs.existsSync(fields.dirPath) ? fs.mkdirpSync(fields.dirPath) : fs.remove(fields.dirPath);
    let fileProject = await lavas.render(fields, tData);
    t.true(fileProject === fields.dirPath);
    // fs.existsSync(fields.dirPath) && fs.remove(fields.dirPath);
});

test('it should be throw a error', async t => {

    store.set('templateConfig', undefined);

    // 渲染出错的 test
    try {
        // 通过获取的 Schema mock 参数
        let fields = await getFields(schema);

        // 对 mock 参数做一些特殊处理
        fields.isStream = true;
        await lavas.render(fields, tData);
    }
    catch (e) {
        t.true(true);
    }
});

test('it should be init project faild', async t => {

    // 渲染出错的 test
    try {
        store.set('templateConfig', tData);
        await lavas.render({email: 'invalidParams'}, tData);
    }
    catch (e) {
        t.true(e.toString().includes('email'));
    }
});

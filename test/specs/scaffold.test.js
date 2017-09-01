/**
 * @file project unit test
 * @author mj(zoumiaojiang@gmail.com)
 */

/* eslint-disable fecs-prefer-async-await */
const test = require('ava');

const lavas = require('../../dist');
const store = require('../../dist/lib/store');
const getFields = require('../helpers/getFields');
const Ajv = require('ajv');

const fs = require('fs-extra');
const path = require('path');

let metaSchema = {};
let schema = {};
let fields = {};
let tmpDir = path.resolve(process.cwd(), './test/tmp');

let fileProject = {};
let streamProject = {};
let errorProject = {};

test.before('get JSON Schema and download template & render template', async t => {

    metaSchema = await lavas.getMetaSchema();
    schema = await lavas.getSchema();
    fields = await getFields(schema);

    fields.dirPath = path.resolve(tmpDir, fields.name || '');

    if (!fs.existsSync(fields.dirPath)) {
        fs.mkdirpSync(fields.dirPath);
    }
    else {
        fs.remove(fields.dirPath);
    }

    // 下载一次 test
    schema = await lavas.download({
        framework: 'vue',
        template: 'Basic'
    }, metaSchema);

    // 多次渲染 test

    // 直接渲染到本地文件系统的 test
    fileProject = await lavas.render(fields, schema);

    // 渲染成 fileReadStream 的 test
    fields.isStream = true;
    streamProject = await lavas.render(fields, schema);

    // 渲染出错的 test
    errorProject = await lavas.render({email: 'invalidParams'}, schema);
});


test('it should be get right JSON schema', async t => {
    let jsonSchema = store.get('jsonSchema');
    t.true(jsonSchema.description === 'lavas scaffold json schema');
});

test('it should be get right schema', async t => {
    let schema = store.get('schema');
    let hasProperties = !!schema
        && (typeof schema === 'object')
        && schema.hasOwnProperty('framework');
    t.true(hasProperties);
});

test('it should be get right fields for project exports', async t => {
    let ajv = new Ajv({allErrors: true});
    let jsonSchema = store.get('jsonSchema');
    let validate = ajv.compile(jsonSchema);
    let valid = validate(fields);

    t.true(valid);
});

test('it should be init project to readFileStream success', async t => {
    t.true(typeof streamProject === 'object');
});


test('it should be init project to fileSystem success', async t => {
    t.true(!fileProject.err);
    t.true(fileProject === fields.dirPath);
    fs.existsSync(fields.dirPath) && fs.remove(fields.dirPath);
});


test('it should be init project faild', async t => {
    t.true(typeof errorProject.err === 'object');
});

/**
 * @file project unit test
 * @author mj(zoumiaojiang@gmail.com)
 */

/* eslint-disable fecs-prefer-async-await */
const test = require('ava');

const project = require('../../dist/lib/project');
const lavasScaffoldSchema = require('../../dist/lib/schema');
const getFields = require('../helpers/getFields');
const Ajv = require('ajv');

const fs = require('fs-extra');
const path = require('path');

let jsonSchema = {};
let schema = {};
let fields = {};
let tmpDir = path.resolve(process.cwd(), './test/tmp');
let fileProject = {};
let streamProject = {};
let errorProject = {};

test.before('get json schema', async t => {
    jsonSchema = await lavasScaffoldSchema.getJsonSchema();
    schema = await lavasScaffoldSchema.getSchema();
    fields = await getFields(schema);

    fields.dirPath = path.resolve(tmpDir, fields.name || '');

    if (!fs.existsSync(fields.dirPath)) {
        fs.mkdirpSync(fields.dirPath);
    }
    else {
        fs.remove(fields.dirPath);
    }

    fileProject = await project.exports(fields);
    streamProject = await project.exports(fields, true);
    errorProject = await project.exports({
        invalidParams: 'invalidParams'
    }, true);
});


test('it should be get right JSON schema', async t => {
    t.true(jsonSchema.description === 'lavas scaffold json schema');
});

test('it should be get right schema', async t => {
    let hasProperties = !!schema
        && (typeof schema === 'object')
        && schema.hasOwnProperty('properties');
    t.true(hasProperties);
});

test('it should be get right fields for project exports', async t => {
    let ajv = new Ajv({allErrors: true});
    let validate = ajv.compile(jsonSchema);
    let valid = validate(fields);

    t.true(valid);
});

test('it should be init project to readFileStream success', async t => {
    t.true(typeof streamProject === 'object');
});


test('it should be init project to fileSystem success', async t => {
    t.false(fileProject.err);
    t.true(fileProject.ret === fields.dirPath);
});


test('it should be init project faild', async t => {
    t.true(typeof errorProject.err === 'object');
});

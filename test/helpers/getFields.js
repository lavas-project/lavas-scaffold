/**
 * @file 获取 mock fields
 * @author mj(zoumiaojiang@gmail.com)
 */

const lavasScaffoldSchema = require('../../dist/lib/schema');
const lavas = require('../../dist');

function questionInput(key, schema, params) {
    let con = schema[key];

    return {
        [key]: con.default
    };
}

function questionYesOrNo(key, schema, params) {
    let con = schema[key];

    return {
        [key]: con.default
    };
}


function questionList(key, schema, params) {
    let con = schema[key];
    let sourceList = [];
    let choiceList = [];

    if (!con.dependence) {
        sourceList = con.list;
    }
    else if (con.depLevel > 0) {

        // 表示是级联的操作
        let dependence = con.dependence;
        let ref = con.ref;
        let depList = schema[dependence].list;
        let depValue = params[dependence] || schema[dependence].list[0].value;

        depList.forEach(depItem => {
            if (depItem.value === depValue) {
                sourceList = (depItem.subList && depItem.subList[ref]) ? depItem.subList[ref] : [];
            }
        });
    }

    sourceList.forEach(item => {
        choiceList.push({
            'value': item.value,
            'name': `${item.name}`,
            'short': item.value
        });
    });

    return {
        [key]: choiceList[0].value
    };
}


module.exports = async function () {
    let metaSchema = await lavasScaffoldSchema.getMetaSchema();
    let templateConfig = await lavas.download({}, metaSchema);
    let schema = await lavasScaffoldSchema.getSchema(templateConfig);

    let params = {};

    for (let key of Object.keys(schema)) {
        let con = schema[key];
        let type = con.type;
        let data = {};

        if (!con.disable) {
            switch (type) {
                case 'string':
                case 'number':
                case 'password':
                    data = questionInput(key, schema, params);
                    break;
                case 'boolean':
                    data = questionYesOrNo(key, schema, params);
                    break;
                case 'list':
                    data = questionList(key, schema, params);
                    break;
            }

            params = Object.assign({}, params, data);
        }
    }

    return params;

};

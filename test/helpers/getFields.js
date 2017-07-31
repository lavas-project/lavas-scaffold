/**
 * @file 获取 mock fields
 * @author mj(zoumiaojiang@gmail.com)
 */

const lavasScaffoldSchema = require('../../lib/schema');

function questionInput(key, schema, params) {
    let con = schema.properties[key];

    return {
        [key]: con.default
    };
}

function questionYesOrNo(key, schema, params) {
    let con = schema.properties[key];

    return {
        [key]: con.default
    };
}


function questionList(key, schema, params) {
    let con = schema.properties[key];
    let sourceList = [];
    let choiceList = [];

    if (!con.dependence) {
        sourceList = con.list;
    }
    else if (con.depLevel > 0) {

        // 表示是级联的操作
        let dependence = con.dependence;
        let ref = con.ref;
        let depList = schema.properties[dependence].list;
        let depValue = params[dependence] || schema.properties[dependence].list[0].value;

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
    let schema = await lavasScaffoldSchema.getSchema();
    let params = {};

    for (let key of Object.keys(schema.properties)) {
        let con = schema.properties[key];
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

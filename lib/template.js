/**
 * @file templates modules
 * @author mj(zoumiaojiang@gmail.com)
 */

/* eslint-disable fecs-prefer-async-await */
const fs = require('fs-extra');
const path = require('path');

const git = require('simple-git');
const glob = require('glob');
const archiver = require('archiver');
const etpl = require('etpl');
const Ajv = require('ajv');

const conf = require('./config');
const getMeta = require('./getMeta');
const store = require('./store');
const schema = require('./schema');

/**
 * 从 git 上 download 代码下来
 *
 * @param  {string} repo       git repo
 * @param  {string} targetPath 存储的目标目录
 * @return {Promise}           promise 对象
 */
function downloadFromGit(repo, targetPath) {
    return new Promise((resolve, reject) => {
        // 如果当前文件系统有 download 的缓存，就不重新 clone 了，将代码直接 pull 下来就好了。
        if (fs.existsSync(targetPath)) {
            git(targetPath).pull((err, updates) => resolve(targetPath));
        }
        else {
            fs.mkdirsSync(targetPath);
            git().clone(repo, targetPath, {}, () => resolve(targetPath));
        }
    });
}

/**
 * 删除某个目录中的指定文件或文件夹
 *
 * @param {string} dir 根目录
 * @param {*} ignores 过滤的文件或文件夹数组
 */
function deleteFilter(dir, ignores = []) {
    ignores
        .concat(...conf.DEFAULT_EXPORTS_IGNORES)
        .forEach(target => {
            let targetPath = path.resolve(dir, target);
            fs.existsSync(targetPath) && fs.removeSync(targetPath);
        });
}

/**
 * 渲染 template 里面的所有文件
 *
 * @param  {Object} params    收集的用户输入字段
 * @param  {string} tmpStoreDir  临时文件夹存储路径
 * @return {Promise}          渲染 promise
 */
function renderTemplate(params, tmpStoreDir) {
    let templateConfig = store.get('templateConfig');
    let dirPath = params.dirPath || process.cwd();
    let etplCompile = new etpl.Engine(templateConfig.etpl || conf.ETPL);

    // 把指定的文件和文件夹都删掉
    deleteFilter(tmpStoreDir, templateConfig.exportsIgnores);

    return new Promise((resolve, reject) => glob(
        '**/*',
        {
            cwd: tmpStoreDir,
            ignore: (templateConfig.renderIgnores || []).concat(...conf.DEFAULT_RENDER_IGNORES)
        },
        (err, files) => {
            files.forEach(file => {
                let filePath = path.resolve(tmpStoreDir, file);

                if (fs.statSync(filePath).isFile()) {
                    let content = fs.readFileSync(filePath, 'utf8');

                    // 这里可以直接通过外界配置的规则，重新计算出一份数据，只要和 template 里面的字段对应上就好了
                    let extDataTpls = templateConfig.extData || {};
                    let extData = {};
                    let commonData = conf.COMMON_DATA;

                    Object
                        .keys(extDataTpls)
                        .forEach(key => (extData[key] = etplCompile.compile(`${extDataTpls[key]}`)(params)));

                    let renderData = Object.assign({}, params, extData, commonData);
                    let afterCon = etplCompile.compile(content)(renderData);

                    fs.writeFileSync(filePath, afterCon);
                }
            });

            if (params.isStream) {
                let archive = archiver('zip', {zlib: {level: 9}});
                let tmpZipPath = path.resolve(tmpStoreDir, '..', 'tmp.zip');
                let output = fs.createWriteStream(tmpZipPath);

                archive.pipe(output);
                archive.directory(tmpStoreDir, params.name);
                archive.finalize().on('finish', () => resolve(fs.createReadStream(tmpZipPath)));
            }
            else {
                fs.copySync(tmpStoreDir, dirPath);
                resolve(dirPath);
            }
        }
    ));
}

/**
 * 获取模版信息
 *
 * @param {Object} metaParam 元参数
 * @return {Object} framework 和 template 信息
 */
async function getTemplateInfo(metaParam) {
    let meta = await getMeta();
    let frameworkValue = metaParam.framework || meta.defaults.framework || 'vue';
    let templateValue = metaParam.template || meta.defaults.template || 'Basic';
    let framework;
    let template;

    meta.frameworks.forEach(item => {
        if (item.value === frameworkValue) {
            framework = item;
        }
    });

    for (let item of meta.frameworks) {
        if (item.value === frameworkValue) {
            framework = item;
        }
    }

    for (let item of framework.subList.template) {
        if (item.value === (templateValue || meta.defaults.template)) {
            template = item;
        }
    }

    store.set('framework', framework);
    store.set('template', template);

    return {
        framework,
        template
    };
}

/**
 * 下载某一个模版 (meta 信息中必须包含 framework 和 template)
 *
 * @param {Object} metaParams  导出模版所需字段, 从 mataSchema 中得出
 * @return {any}              导出的结果
 */
exports.download = async function (metaParams = {}) {
    let {framework, template} = await getTemplateInfo(metaParams);
    let gitRepo = template.git;
    let storeDir = path.resolve(conf.LOCAL_TEMPLATES_DIR, framework.value, template.value);
    let ajv = new Ajv({allErrors: true});
    let metaJsonSchema = store.get('metaJsonSchema') || await schema.getMetaJsonSchema();
    let validate = ajv.compile(metaJsonSchema);
    let valid = validate(metaParams);

    if (!valid) {
        throw new Error(JSON.stringify(validate.errors));
    }
    try {
        await downloadFromGit(gitRepo, storeDir);
        store.set('storeDir', storeDir);

        let templateConfigContent = fs.readFileSync(path.resolve(storeDir, 'meta.json'), 'utf-8');
        let templateConfig = JSON.parse(templateConfigContent);

        store.set('templateConfig', templateConfig);

        return templateConfig;
    }
    catch (e) {
        throw new Error('下载 Lavas 模版出错，请检查当前网络。');
    }
};

/**
 * 渲染某一个模版
 *
 * @param {Object} params 收集到的用户输入的参数
 * @return {*} 导出的结果
 */
exports.render = async function (params) {
    let templateConfig = store.get('templateConfig');

    if (!templateConfig) {
        throw new Error('请先调用 lavasScaffold.download() 方法下载模板配置文件');
    }

    let tmpStoreDir = path.resolve(conf.LOCAL_TEMPLATES_DIR, `${Date.now()}`);
    let storeDir = store.get('storeDir');
    let ajv = new Ajv({allErrors: true});
    let jsonSchema = store.get('jsonSchema') || await schema.getJsonSchema(templateConfig);
    let validate = ajv.compile(jsonSchema);
    let valid = validate(params);

    if (!valid) {
        throw new Error(JSON.stringify(validate.errors));
    }

    try {
        if (!fs.existsSync(storeDir)) {
            await this.download(params);
        }

        fs.mkdirsSync(tmpStoreDir);
        fs.copySync(storeDir, tmpStoreDir);

        let renderResult = await renderTemplate(params, tmpStoreDir);

        fs.removeSync(tmpStoreDir);

        return renderResult;
    }
    catch (e) {
        throw new Error('Lavas 模板渲染出错');
    }
};

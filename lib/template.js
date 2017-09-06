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
const utils = require('./utils');

/**
 * 从 git 上 download 代码下来
 *
 * @param  {string} repo       git repo
 * @param  {string} targetPath 存储的目标目录
 * @return {Promise}           promise 对象
 */
function downloadFromGit(repo, targetPath) {

    if (!utils.hasCommand('git')) {
        throw new Error('Lavas 初始化依赖 Git, 请确认您的机器已经安装了 Git 命令');
    }

    return new Promise((resolve, reject) => {
        try {
            // 如果当前文件系统有 download 的缓存，就不重新 clone 了，将代码直接 pull 下来就好了。
            if (fs.existsSync(targetPath)) {
                git(targetPath).pull((err, updates) => resolve(targetPath));
            }
            else {
                fs.mkdirsSync(targetPath);
                git().clone(repo, targetPath, {}, () => resolve(targetPath));
            }
        }
        catch (e) {
            throw new Error('下载 Lavas 模版出错，请检查当前网络。');
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
 * 注入模版文件
 *
 * @param {string} dir 注入的目录
 */
function addDefaultFiles(dir) {
    let templateDir = path.resolve(__dirname, '..', 'templates');
    fs.readdirSync(templateDir).forEach(item => {
        let templateItemPath = path.resolve(templateDir, item);
        let targetPath = path.resolve(dir, item);

        fs.copySync(templateItemPath, targetPath, {overwrite: true});
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

    // 渲染之前先组织一下将要导出的项目目录结构，分为两部分

    // 1、把指定的开发者不需要的文件和文件夹都删掉
    deleteFilter(tmpStoreDir, templateConfig.exportsIgnores);

    // 2、将 Lavas 强依赖的文件注入到即将导出的工程中(这里最好只做根目录的代码注入)
    addDefaultFiles(tmpStoreDir);

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

                    Object.keys(extDataTpls).forEach(key => {
                        extData[key] = etplCompile.compile(`${extDataTpls[key]}`)(params);
                    });

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
 * @param  {Object} metaParam 元参数
 * @return {Object} framework 和 template 信息
 */
async function getTemplateInfo(metaParam) {
    try {
        let meta = await getMeta();
        let frameworkValue = metaParam.framework || meta.defaults.framework || 'vue';
        let templateValue = metaParam.template || meta.defaults.template || 'lavasTemplate';
        let framework = meta.frameworks.filter(item => item.value === frameworkValue)[0];
        let template = framework.subList.template.filter(item => item.value === templateValue)[0];

        store.set('framework', framework);
        store.set('template', template);

        return {
            framework,
            template
        };
    }
    catch (e) {
        // 如果这一步出错了，只能说明是 BOS 上的 Meta 配置格式错误。。
        throw new Error('Meta Config Error');
    }
}

/**
 * 下载一个指定的模版
 *
 * @param  {Object} metaParams  导出模版所需字段, 从 mataSchema 中得出
 * @return {Objecy}             导出的结果
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

    await downloadFromGit(gitRepo, storeDir);
    store.set('storeDir', storeDir);

    let templateConfigContent = fs.readFileSync(path.resolve(storeDir, 'meta.json'), 'utf-8');
    let templateConfig = JSON.parse(templateConfigContent);

    store.set('templateConfig', templateConfig);

    return templateConfig;
};

/**
 * 渲染指定的模板模版
 *
 * @param {Object} params 收集到的用户输入的参数
 * @return {*} 导出的结果
 */
exports.render = async function (params) {
    let templateConfig = store.get('templateConfig') || await this.download(params);
    let tmpStoreDir = path.resolve(conf.LOCAL_TEMPLATES_DIR, `${Date.now()}`);
    let storeDir = store.get('storeDir');
    let ajv = new Ajv({allErrors: true});
    let jsonSchema = schema.getJsonSchema(templateConfig);
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

# lavas-scaffold

[![npm version](https://badge.fury.io/js/lavas-scaffold.svg)](https://badge.fury.io/js/lavas-scaffold)
[![npm download](https://img.shields.io/npm/dm/lavas-scaffold.svg)](https://npmjs.org/lavas-scaffold)
[![Build Status](https://travis-ci.org/lavas-project/lavas-scaffold.svg?branch=master)](https://travis-ci.org/lavas-project/lavas-scaffold)

[![NPM](https://nodei.co/npm/lavas-scaffold.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/lavas-scaffold/)

Lavas 工程化解决方案脚手架解决方案，通过个 [lavas-config](https://github.com/lavas-project/lavas-config) 的配合实现的一套 Lavas 脚手架工具，配合 Lavas-cli 使用。

### 安装

```bash
npm install --save lavas-scaffold
```

### API

lavas-scaffold 提供 4 个 Promise 接口，使用方法如下：

```js
const lavasScaffold = require('lavas-scaffold');

// API: getMetaSchema()
// 获取下载和渲染模板的 MetaSchema, 用来确定将要下载的是哪个模板
const metaSchema = await lavasScaffold.getMetaSchema();

// 下载模板
// metaParams 是通过 metaSchema 从用户收集的字段
const templateConf = await lavasScaffold.download(metaParams);

// 获取 Lavas 初始化所需的渲染字段
const fieldSchema = await lavasScaffold.getSchema(templateConf);
// 如果没有 templateConf 参数，会取默认的模板配置（即 MetaSchema 指定的配置）。


// 渲染模板
// renderParams 是通过 fieldSchema 而从用户输入收集的字段
const projectPath = await lavasScaffold.render(renderParams, templateConf);
// 如果没有 templateConf 参数，会取默认的模板配置（即 MetaSchema 指定的配置）。

//如果需要将 project 以 FileReadStream 导出的话
renderParams.isStream = true;
const projectStream = await lavasScaffold.render(renderParams, templateConf);
```

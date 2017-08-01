# lavas-scaffold

[![npm version](https://badge.fury.io/js/lavas-scaffold.svg)](https://badge.fury.io/js/lavas-scaffold)
[![npm download](https://img.shields.io/npm/dm/lavas-scaffold.svg)](https://npmjs.org/lavas-scaffold)
[![Build Status](https://travis-ci.org/lavas-project/lavas-scaffold.svg?branch=master)](https://travis-ci.org/lavas-project/lavas-scaffold)

[![NPM](https://nodei.co/npm/lavas-scaffold.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/lavas-scaffold/)

> Lavas 工程化解决方案脚手架解决方案

### 安装

```bash
npm install --save lavas-scaffold
```

### API

lavas-scaffold 提供两个 Promise 接口

```js
const lavasScaffold = require('lavas-scaffold');

// 获取 Lavas 初始化所需的渲染字段
const fieldSchema = await lavasScaffold.getSchema();


// 导出 lavas 工程
const result = await lavasScaffold.exports(fields, [isStream]);
```

> Note
> 
> fileds: fileds 的值为通过 fieldSchema 的约定而搜集的字段参数，一般在用户界面搜集用户自定义输入。
>
> isStream: 是指定产物形态，当值为 true 的时候，产物为 zip 包的 readStream，当值为 false 的时候，返回导出工程文件夹的 path


/**
 * @file clearFixture.js
 * @author mj(zoumiaojiang@gmail.com)
 */

const fs = require('fs-extra');
const path = require('path');


const dirPath = path.resolve(process.cwd(), './test/tmp');

fs.removeSync(dirPath);

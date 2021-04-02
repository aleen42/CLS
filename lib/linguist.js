/***********************************************************************
 *                                                                   _
 *       _____  _                           ____  _                 |_|
 *      |  _  |/ \   ____  ____ __ ___     / ___\/ \   __   _  ____  _
 *      | |_| || |  / __ \/ __ \\ '_  \ _ / /    | |___\ \ | |/ __ \| |
 *      |  _  || |__. ___/. ___/| | | ||_|\ \___ |  _  | |_| |. ___/| |
 *      |_/ \_|\___/\____|\____||_| |_|    \____/|_| |_|_____|\____||_|
 *
 *      ================================================================
 *                 More than a coder, More than a designer
 *      ================================================================
 *
 *
 *      - Document: index.js
 *      - Author: aleen42
 *      - Description: the map of languages from https://github.com/github/linguist/blob/master/lib/linguist/languages.yml
 *      - Create Time: Apr 2nd, 2021
 *      - Update Time: Apr 2nd, 2021
 *
 *
 **********************************************************************/

const fs = require('fs');
const path = require('path');
module.exports = require('js-yaml').load(fs.readFileSync(path.resolve(__dirname, './languages.yml'), 'utf8'));

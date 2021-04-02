#! /usr/bin/env node

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
 *      - Document: start.js
 *      - Author: aleen42
 *      - Description: main entry
 *      - Create Time: May 9th, 2016
 *      - Update Time: Apr 2nd, 2021
 *
 *
 **********************************************************************/

/**
 * [cls: import the module]
 * @type {Object}
 */
const {calculate} = require('./index');
const stats = require('../package.json');
const enhance = str => `\x1b[32m${str}\x1b[0m`;
const optional = str => `\x1b[90m${str}\x1b[0m`;
const brand = `
                                                                  _
      _____  _                           ____  _                 |_|
     |  _  |/ \\   ____  ____ __ ___     / ___\\/ \\   __   _  ____  _
     | |_| || |  / __ \\/ __ \\\\ '_  \\ _ / /    | |___\\ \\ | |/ __ \\| |
     |  _  || |__. ___/. ___/| | | ||_|\\ \\___ |  _  | |_| |. ___/| |
     |_/ \\_|\\___/\\____|\\____||_| |_|    \\____/|_| |_|_____|\\____||_| 
                                                                     
     ================================================================
                More than a coder, More than a designer              
     ================================================================
`;

/**
 * [opt: help options]
 * @type {[type]}
 */
const opt = require('node-getopt')
	.create([
		['u', 'user=ARG', `\tGitHub's user_name (${enhance('required')})`],
		['t', 'token=ARG', `\tPersonal API tokens for calling GitHub APIs (${enhance('required')})`],
        ['', 'filter[=filter]', `\tStatistic filter:
\t${optional('--filter=original')} \t  non-forked repositories (${enhance('default')}),
\t${optional('--filter=all')} \t\t  all repositories`],
        ['', 'batch[=num]', `\tBatching task number:
\t${optional('--batch=6')} \t\t  6 (${enhance('default')})`],
		['', 'repo[=repo]', `\tStatistic for a specific repository:
\t${optional('--repo=all')} \t\t  for all repositories (${enhance('default')})`],
		['a', 'accurate', '\tShow accurate number'],
		['l', 'line', '\tShow lines'],
		['v', 'version', '\tShow current version'],
		['h' , 'help', '\tTutorial for this command']
	])
	.setHelp(`${brand}
\tVersion: ${enhance(stats.version)}
\tUsage: cls -u ${enhance('<user_name>')} -t ${enhance('<github token>')} [options]

[[OPTIONS]]`)
	.bindHelp()
	.parseSystem();

const {version, user: owner, repo = 'all', line: showLine = false, accurate = false} = opt.options;
if (version) {
	console.log(`${brand}
\t\tCLS v${enhance(stats.version)}, Copyright © aleen42 2012-2021`);
	return;
}

const _splitNumber = num => `${num}`.split('')
    .map((val, index) => (`${num}`.length - index) % 3 === 0 && index
        ? `,${val}`
        : val)
    .join('');

const _sizeToByte = size => ['GB', 'MB', 'KB', 'B'].reduce((result, unit, index, arr) => result ||
        (size >= Math.pow(1024, arr.length - index - 1)
            ? `${(size / Math.pow(1024, arr.length - index - 1)).toFixed(2)}${unit}`
            : ''), '');

console.time('task');

/**
 * callback
 * @param {array}  data
 * @param {number} repoLen
 * @param {number} total
 */
calculate(opt.options, (data, repoLen, total) => {
    /**
     * [table: client table]
     * @type {Table}
     */
    const CliTable = require('cli-table');
    const table = new CliTable({
        chars: {
            'top': '=',
            'top-mid': '=',
            'top-left': '=',
            'top-right': '=',
            'bottom': '=',
            'bottom-mid': '=',
            'bottom-left': '=',
            'bottom-right': '=',
            'left': '',
            'left-mid': '',
            'mid': '',
            'mid-mid': '',
            'right': '',
            'right-mid': '',
            'middle': '',
        },
    });

    /** generate table */
    table.push({ Owner: owner });

    repo !== 'all' ? table.push({ Repository: enhance(repo) }) : table.push({ 'Repositories Number': enhance(repoLen) });

    table.push({
        '': [
            showLine ? 'Line' : 'Bytes',
            'Percentage',
            'Markdown Badges',
        ],
    });

    data.length > 1 && table.push({
        Total: [
            showLine
                ? `${_splitNumber(total)}L`
                : accurate
                    ? _splitNumber(total)
                    : _sizeToByte(total),
            '100%',
        ],
    });

    Object.entries(data).sort((a, b) => b[1] - a[1]).forEach(([key, count]) => {
        const texture = showLine
            ? `${_splitNumber(count)}L`
            : accurate
                ? _splitNumber(count)
                : _sizeToByte(count);

        table.push({
            [key]: [
                enhance(texture),
                enhance(`${parseFloat(count / total * 100).toFixed(2)}%`),
                optional(`https://img.shields.io/badge/%20%20${encodeURIComponent(key)}-%20%20%20%20${texture}-${(require('language-map')[key].color || '#ededed').slice(1)}.svg`),
            ],
        });
    });

    console.log(`${brand}
\t\tCLS v${enhance(stats.version)}, Copyright © aleen42 2012-2021

${table}`);
    console.timeEnd('task');
});

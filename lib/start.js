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
 *      - Description: for shell script to use
 *      - Create Time: May 9th, 2016
 *      - Update Time: May 11st, 2016
 *
 *
 **********************************************************************/

/**
 * [cls: import the module]
 * @type {Object}
 */
const cls = require("./index");

/**
 * [opt: help options]
 * @type {[type]}
 */
const opt = require('node-getopt')
	.create([
		['u', 'user=ARG', '\tGitHub\'s user_name'],
		['t', 'token=ARG', '\tPersonal API tokens for calling GitHub APIs'],
		['', 'filter[=filter]', '\tSatistic filter: \n\t(ex.)\n\t--filter=all \t\tfor all repositories (default), \n\t--filter=original \tfor original repositories, \n\t--filter=fork \t\tfor your forking repositories'],
		['', 'color[=corlor]', '\tSatistic filter: \n\t(ex.)\n\t--color=random \t\tfor badges with random colors (default), \n\t--color=blue \t\tfor badges with blue themes, \n\t--color=red \t\tfor badges with red themes'],
		['', 'repo[=repo]', '\tSatistic for a specific repostiory: \n\t(ex.)\n\t--repo=all \t\tfor all repositories (default)'],
		['a', 'accurate', '\tShow accurate number'],
		['l', 'line', '\tShow lines'],
		['v', 'version', '\tShow current version'],
		['', 'badges-lists', '\tShow a list of badges for markdown'],
		['h' , 'help', '\tTutorial for this command']
	])
	.setHelp('\
\n\n\nUseAge: cls -u <user_name> -t <github token> [options]\
\n                                                                  _\
\n      _____  _                           ____  _                 |_|\
\n     |  _  |/ \\   ____  ____ __ ___     / ___\\/ \\   __   _  ____  _\
\n     | |_| || |  / __ \\/ __ \\\\ \'_  \\ _ / /    | |___\\ \\ | |/ __ \\| |\
\n     |  _  || |__. ___/. ___/| | | ||_|\\ \\___ |  _  | |_| |. ___/| |\
\n     |_/ \\_|\\___/\\____|\\____||_| |_|    \\____/|_| |_|_____|\\____||_| \
\n                                                                     \
\n     ================================================================\
\n                More than a coder, More than a designer              \
\n     ================================================================\n\n\n\n[[OPTIONS]]\n\n\n\n')
	.bindHelp()
	.parseSystem();

if (opt.options.version) {
	console.log('\n\
\n                                                                  _\
\n      _____  _                           ____  _                 |_|\
\n     |  _  |/ \\   ____  ____ __ ___     / ___\\/ \\   __   _  ____  _\
\n     | |_| || |  / __ \\/ __ \\\\ \'_  \\ _ / /    | |___\\ \\ | |/ __ \\| |\
\n     |  _  || |__. ___/. ___/| | | ||_|\\ \\___ |  _  | |_| |. ___/| |\
\n     |_/ \\_|\\___/\\____|\\____||_| |_|    \\____/|_| |_|_____|\\____||_| \
\n                                                                     \
\n     ================================================================\
\n                More than a coder, More than a designer              \
\n     ================================================================\
\n\
\n               CLS v2.1.6, Copyright © aleen42 2012-2016\n\n');
	return;
}

cls.calculate(opt.options.user, opt.options);
console.time('CLS');

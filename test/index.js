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
 *      - Description: this is the entrace of some tests
 *      - Create Time: May 11st, 2016
 *      - Update Time: May 11st, 2016
 *
 *
 **********************************************************************/

const cls = require('../lib/index');

/**
 * [should: test framework module]
 * @type {Object}
 */
const should = require('chai').should();

describe('tests', function () {
	it('test case', function () {
    	cls.test().should.equal('\n\n\nUseAge: cls -u <user_name> -t <github token> [options]\n                                                                  _\n      _____  _                           ____  _                 |_|\n     |  _  |/ \\   ____  ____ __ ___     / ___\\/ \\   __   _  ____  _\n     | |_| || |  / __ \\/ __ \\\\ \'_  \\ _ / /    | |___\\ \\ | |/ __ \\| |\n     |  _  || |__. ___/. ___/| | | ||_|\\ \\___ |  _  | |_| |. ___/| |\n     |_/ \\_|\\___/\\____|\\____||_| |_|    \\____/|_| |_|_____|\\____||_| \n                                                                     \n     ================================================================\n                More than a coder, More than a designer              \n     ================================================================\n\n\n\n  -u, --user=ARG         \tGitHub\'s user_name\n  -t, --token=ARG        \tPersonal API tokens for calling GitHub APIs\n      --filter[=filter]  \tSatistic filter: \n\t(ex.)\n\t--filter=all \t\tfor all repositories (default), \n\t--filter=original \tfor original repositories, \n\t--filter=fork \t\tfor your forking repositories\n      --color[=corlor]   \tSatistic filter: \n\t(ex.)\n\t--color=random \t\tfor badges with random colors (default), \n\t--color=blue \t\tfor badges with blue themes, \n\t--color=red \t\tfor badges with red themes\n      --repo[=repo]      \tSatistic for a specific repostiory: \n\t(ex.)\n\t--repo=all \t\tfor all repositories (default)\n  -a, --accurate         \tShow accurate number\n  -l, --line             \tShow lines\n  -v, --version          \tShow current version\n      --badges-lists     \tShow a list of badges for markdown\n  -h, --help             \tTutorial for this command\n\n\n\n\n');
    });
});

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
 *      - Description: the main library of CLS tool
 *      - Create Time: May 9th, 2016
 *      - Update Time: Apr 2nd, 2021
 *
 *
 **********************************************************************/

/**
 * [request: request module]
 * @type {[type]}
 */
const request = require('request');

/**
 * [exec: shell_exec module]
 * @type {[type]}
 */
const {exec, execSync} = require('child_process');

/**
 * error wrapper
 * @param str
 * @returns {string}
 */
const ERROR = `\x1b[31m${'error   '}\x1b[0m`;
const WARNING = `\x1b[33m${'warning '}\x1b[0m`;

const extract = str => str.split(/\r?\n/);

/**
 * linguist db
 * @type {object}
 */
const linguist = require('./linguist');
/**
 * stdio stream
 * @type {process.stdout|{}}
 */
let stream = process.stdout;
/**
 * total number of code bytes
 * @type {number}
 */
let totalBytes = 0;
/**
 * total number of code lines
 * @type {number}
 */
let totalLines = 0;
/**
 * global loading widget
 * @type {object}
 */
let loader;

/**
 * GitHub Access Token
 * @type {string}
 */
let token = '';
/**
 * batching task number
 * @type {number}/
 */
let batch = 6;
/**
 * proxy configuration for subversion
 * @type {string}
 */
let proxyConfig = '';

module.exports = {
    /**
     * [test: test function of this module]
     * @return {[type]}    [description]
     */
    test: () => execSync('cls -h').toString(),

    /**
     * calculate entry
     * @param {string}   owner          the name of the user
     * @param {string}   [filter]       options for filter: all|original
     * @param {boolean}  [accurate]     accurate statistic: false|true
     * @param {boolean}  [showLine]     calculate line: false|true
     * @param {string}   [accessToken]  generated API token
     * @param {string}   [repo]         repository name
     * @param {string}   [batchNum]     batching task number
     * @param {function} callback       callback table
     */
    calculate(
        {
            user: owner,
            filter = 'original',
            accurate = false,
            line: showLine = false,
            token: accessToken = '',
            repo = 'all',
            proxy = '',
            batch: batchNum = 6
        }, callback) {
        if (!owner) {
            rewrite(`${ERROR}You may have to specify which user to calculate statistic.`);
            return;
        }

        if (!accessToken) {
            rewrite(`${ERROR}Where is your generated GitHub API token for us?`);
            return;
        }

        if (proxy) {
            try {
                // TODO: support socks5?
                const {port, hostname} = new URL(proxy);
                proxyConfig = `--config-option servers:global:http-proxy-host=${hostname} --config-option servers:global:http-proxy-port=${port}`;
            } catch (ignore) {
                rewrite(`${ERROR}Invalid proxy.`);
                return;
            }
        }

        batch = parseInt(batchNum);
        token = accessToken;

        const _handler = repos => {
            if (!repos.length) {
                rewrite(`${ERROR}${repo === 'all' ? 'The user has no repositories' : 'No such repository'}`);
                return;
            }

            /** filter */
            filter === 'original' && (repos = repos.filter(repo => !repo.fork));

            const data = {};
            const current = [];
            const total = repos.length;

            let index = 0;
            let statistic;

            loader = new Loading(() => {
                const list = current.map(name => `\x1b[33m${name}\x1b[0m`);
                return `[${index}/${total}] Calculating ${list.length > 2
                    ? `${list.slice(0, 2).join(', ')} ...`
                    : list.join(', ')}`;
            });

            /**
             * recursive statistic for languages
             * @param {array}    repos
             * @param {function} callback
             * @param {boolean}  showLine
             * @param {object}   total
             */
            (statistic = (repos, callback, showLine) => {
                const _next = (completed, resolve = statistic.bind(null, repos, callback, showLine)) => {
                    index++;
                    current.splice(current.indexOf(completed), 1);
                    index === total ? callback(data) : resolve();
                };

                const escapeRegExp = str => `${str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}`;
                const _pattern = lang => `(?:${
                    linguist[lang].extensions.map(escapeRegExp).join('|')
                }|(?:^(?:${
                    (linguist[lang].filenames || []).map(escapeRegExp).join('|')
                })))$`;

                if (showLine) {
                    repos
                        .splice(0, index > 0 ? 1 : (batch > 0 ? batch : 6))
                        .forEach(({name, languages_url: languages, svn_url: svn, default_branch: branch, full_name: repoName}) => {
                            current.unshift(name);
                            load(languages, token, result => {
                                const repoLanguages = Object.keys(result).filter(lang => linguist[lang]);
                                switch (process.platform) {
                                    case 'darwin':
                                    case 'win32':
                                    case 'linux':
                                        /** todo: check truncated flag (limitation: 1,000 files for a directory) */
                                        load(`https://api.github.com/repos/${repoName}/git/trees/${branch}?recursive=1`, token, ({tree}) => {
                                            /**
                                             * files path
                                             * @type {string[]}
                                             */
                                            const files = tree
                                                .filter(({type, path}) => type === 'blob' && RegExp(repoLanguages.map(_pattern).join('|')).test(path))
                                                .map(({path}) => path);

                                            if (!files.length) {
                                                rewrite(`${WARNING}The repository has no accessible code for statistic: [${name}]`);
                                                _next(name);
                                                return;
                                            }

                                            /** calculate each language */
                                            Promise.all(repoLanguages.map(lang => Promise.all(files
                                                .filter(path => new RegExp(_pattern(lang), 'i').test(path))
                                                .map(path => new Promise(resolve => {
                                                    /** calculate each file of specified language */
                                                    exec(`svn --non-interactive --trust-server-cert ${proxyConfig} cat "${svn}/trunk/${path}"`, {
                                                        encoding: 'utf8',
                                                        maxBuffer: 5000 * 1024, /** 200 * 1024 by default */
                                                    }, (err, stdout) => err
                                                        ? resolve(0)
                                                        : resolve(parseInt(extract(stdout).filter(i => i).length)));
                                                }))
                                            ).then(group => {
                                                const line = group.reduce((prev, item) => prev + item, 0);
                                                if (line > 0) {
                                                    data[lang] = data[lang] ? data[lang] + line : line;
                                                    totalLines += line;
                                                }
                                            }, err => {
                                                rewrite(`${ERROR}Failed to access files\n${err.message}`);
                                            }))).then(_next.bind(null, name, void 0));
                                        });
                                        break;
                                    default:
                                        rewrite(`${ERROR}Unknown platform`);
                                        break;
                                }
                            });
                        });
                } else {
                    repos.forEach(({name, languages_url: languages}) => {
                        current.unshift(name);
                        load(languages, token, result => {
                            Object.entries(result).forEach(([lang, bytes]) => {
                                data[lang] = data[lang] ? data[lang] + bytes : bytes;
                                totalBytes += bytes;
                            });

                            rewrite('');
                            _next(name, () => '');
                        });
                    });
                }
            })(repos, data => {
                loader.loaded();
                callback && callback(data, total, showLine ? totalLines : totalBytes);
            }, showLine);
        };

        repo === 'all' ? listRepo(owner, _handler) : getRepo(owner, repo, _handler);
    },
};

function load(url, token, callback) {
    request({
        url,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36',
            'Authorization': `token ${token}`,
        },
    }, (error, response, body) => {
        if (!response) {
            rewrite(`${ERROR}Please check network!`);
            callback();
        } else if (!error && response.statusCode === 200) {
            callback(JSON.parse(body));
        } else if (response.statusCode === 403) {
            rewrite(`${ERROR}Limited rate with your access token, please wait for a moment!`);
            callback();
        } else {
            rewrite(`${ERROR}Failed to get data!`);
            callback();
        }
    });
}

/**
 * to list repositories recursively
 * @param {string}   owner    the owner of the repository
 * @param {function} callback
 * @param {array}    [data]
 * @param {number}   [page]
 */
function listRepo(owner, callback, data = [], page = 1) {
    loader = new Loading(`Loading the list of repositories`);
    load(`https://api.github.com/users/${owner}/repos?per_page=100&page=${page}`, token, result => {
        loader.loaded();
        if (!result) return;
        !result.length ? callback(data) : listRepo(owner, callback, data.concat(result), ++page);
    });
}

/**
 * get specific repository
 * @param {string}   owner the owner of the repository
 * @param {string}   repo
 * @param {function} callback
 */
function getRepo(owner, repo, callback) {
    loader = new Loading(`Loading the repository information: ${repo}`);
    load(`https://api.github.com/repos/${owner}/${repo}`, token, result => {
        loader.loaded();
        if (!result) return;
        callback([result]);
    });
}

function Loading(str) {
    const charArr = ['/', '-', '\\', '-'];
    let count = 0;
    const loadingTimer = setInterval(() => {
        rewrite(`[${charArr[++count % charArr.length]}] ${typeof str === 'function' ? str() : str}`);
    }, 60);

    return {
        loaded: () => {
            clearInterval(loadingTimer);
            rewrite('');
        },
    };
}

function rewrite(str) {
    stream.clearLine();
    stream.cursorTo(0);
    str && stream.write(str);
}

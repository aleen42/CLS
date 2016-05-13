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
 *      - Description: the main entrance for CLS
 *      - Create Time: May 9th, 2016
 *      - Update Time: May 9th, 2016
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
const execSync = require('child_process').execSync;
const spawnSync = require('child_process').spawnSync;

/**
 * [progressBar: a module to shopw progress]
 * @type {Object}
 */
const progressBar = require('progress');

/**
 * [bar: progress bar]
 * @type {progressBar}
 */
var bar = null;

/**
 * [cliTable: cli-table module]
 * @type {[type]}
 */
const cliTable = require('cli-table');

/**
 * [table: client table]
 * @type {Table}
 */
var table = new cliTable();

/**
 * [cliTable: client tables]
 * @type {[type]}
 */
// const cliTable = require('cli-table');

module.exports = {
	/**
	 * [stream: std stream]
	 * @type {[type]}
	 */
	stream: process.stderr,

	/**
	 * [totalBytes: total number of code bytes]
	 * @type {Number}
	 */
	totalBytes: 0,

	/**
	 * [totalBytes: total number of code lines]
	 * @type {Number}
	 */
	totalLines: 0,

	/**
	 * [fileSuffix: file suffix for each languages]
	 * @type {Object}
	 */
	fileSuffix: {
		'JavaScript': ['*.js$', '*.jsx$', '*.sublime-settings$'],
		'HTML': ['*.html$', '*.htm$', '*.xhtml$', '*.jhtml$'],
		'PHP': ['*.php$', '*.php4$', '*.php3$', '*.phtml$'],
		'C': ['*.h$', '*.c$'],
		'C++': ['*.h$', '*.cpp$'],
		'C#': ['*.cs$'],
		'CSS': ['*.css$'],
		'Objective-C': ['*.h$', '*.m$'],
		'Objective-C++': ['*.h$', '*.mm$'],
		'Java': ['*.java$', '*.jsp$', '*.jspx$', '*.wss$', '*.do$', '*.action$'],
		'Shell': ['*.sh$'],
		'Visual Basic': ['*.vb$'],
		'Python': ['*.py$'],
		'Ruby': ['*.rb$', '*.rhtml$'],
		'Makefile': ['Makefile'],
		'Erlang': ['*.yaws$'],
		'Perl': ['*.pl$', 'errchk'],
		'CMake': ['CMakeLists.txt', '*.cmake$', 'OpenCVConfig.cmake.in'],
		'PostScript': ['*.eps$', '*.ps$', '*.PS$'],
		'ActionScript': ['*.as$'],
		'xBase': ['*.prg$', '*.PRG$'],
		'Go': ['*.go$'],
		'Assembly': ['*.m$'],
		'Cuda': ['*.cu$'],
		'ApacheConf': ['*.htaccess$'],
		'Puppet': ['*.pp$', 'Modulefile']
	},

	/**
	 * [colorThemes: color set of different themes]
	 * @type {Object}
	 */
	colorThemes: {
		'blue': [
			'023541',
			'0a5f73',
			'057791',
			'084d5d',
			'003d40',
			'076c70',
			'02888e',
			'05575b',
			'00666b',
			'1d8489',
			'01939a',
			'017277',
			'00595e'
		],
		'red': [
			'7e0603',
			'a61f1c',
			'820300',
			'a5100d',
			'821400',
			'a5240d',
			'970808',
			'690000',
			'ba0b0b',
			'ba1c0b',
			'971608',
			'a10000',
			'eb2102'
		]
	},

	/**
	 * [getJSON: use get request to get data]
	 * @param  {[type]}   option   [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	getJSON: function (requestUri, callback) {
		request({
			'url': requestUri,
			'headers': {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36'
			}
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				callback(body);
			} else if (response.statusCode == 403) {
				callback(body, '[Error: rate limiting for GitHub]');
			} else {
				callback(body, '[Error: error to get data]');
			}
		});
	},

	/**
	 * [listRepo: to list someone repos recursively]
	 * @param  {[type]} userName [the name of the user]
	 * @return {[type]}          [description]
	 */
	listRepo: function (userName, callback, data, page, token) {
		const perPage = 100;
		var token = token || '';
		const requestUri = 'https://api.github.com/users/' + userName + '/repos?per_page=100&page=' + page + '&access_token=' + token;
		const _this = this;
		
		var charArr = ['/', '-', '\\', '-'];
		var count = 0;
		var timeTick = setInterval(function () {
			const str = 'Get data: [' + charArr[count] + ']';

			_this.stream.clearLine();
		    _this.stream.cursorTo(0);
		    _this.stream.write(str);
			count = (count + 1) % charArr.length;
		}, 100);

		this.getJSON(requestUri, function (body, error) {
			clearInterval(timeTick);

			var str = '';

			/** exceptions */
			error = error || '';

			if (error != '') {
				console.log(body);

				str = 'Get data: ' + error;

				_this.stream.clearLine();
			    _this.stream.cursorTo(0);
			    _this.stream.write(str);

				console.log('');
				return;
			}

			const obj = JSON.parse(body);
			
			if (obj.length == 0) {
				str = 'Get data: [OK]';

				_this.stream.clearLine();
			    _this.stream.cursorTo(0);
			    _this.stream.write(str);

				console.log('');
				callback(data);
			} else {
				data = data.concat(obj);
				_this.listRepo(userName, callback, data, ++page, token);
			}
		});
	},

	/**
	 * [statistic: recursive statistic for languages]
	 * @param  {[type]} uriArr  [description]
	 * @param  {[type]} data    [description]
	 * @param  {[type]} index   [description]
	 * @return {[type]}         [description]
	 */
	statistic: function (uriArr, callback, data, index, line) {
		const _this = this;

		if (line) {
			_this.getJSON(uriArr[index].languages_url, function (body) {
				const obj = JSON.parse(body);

				var larr = [];
				for (var lang in obj) {
					if (typeof(_this.fileSuffix[lang]) == 'undefined') {
						continue;
					}

					larr.push(_this.fileSuffix[lang].join('|'));
				}

				console.log('Calculating repos: ' + uriArr[index].name);

				var farr = execSync('svn ls -R "' + uriArr[index].clone_url + '/trunk/" | egrep "' + larr.join('|') + '" | xargs -n1 -i echo ' + uriArr[index].clone_url + '/trunk/{} | awk "{print $1$2}"').toString();

				/** [if: prevent from occuring situation: svn error] */
				if (farr == '') {
					farr = execSync('svn ls -R "' + uriArr[index].svn_url + '/trunk/" | egrep "' + larr.join('|') + '" | xargs -n1 -i echo ' + uriArr[index].svn_url + '/trunk/{} | awk "{print $1$2}"').toString();
				}

				/** calculate each languages */
				for (var lang in obj) {
					/** catch exception of no suffix data */
					if (typeof(_this.fileSuffix[lang]) == 'undefined') {
						continue;
					}

					/** catch exception of GitHub Statistic */
					var isIndex = false;

					for (var langItem in _this.fileSuffix[lang]) {
						var extract = _this.fileSuffix[lang][langItem].indexOf('.') >= 0 ? _this.fileSuffix[lang][langItem].substr(_this.fileSuffix[lang][langItem].indexOf('.') + 1, _this.fileSuffix[lang][langItem].length - _this.fileSuffix[lang][langItem].indexOf('.') - 2) : _this.fileSuffix[lang][langItem];

						if (farr.indexOf(extract) >= 0) {
							isIndex = true;
						}
					}

					if (!isIndex) {
						continue;
					}

					/** start to calculate */
					var specificFilesArr = execSync('echo "' + farr + '" | egrep "' + _this.fileSuffix[lang].join('|') + '"').toString().split('\n');
		
					var count = 0;
					var str = '';

					for (var specificFile in specificFilesArr) {
						if (specificFilesArr[specificFile] != '') {
							count += parseInt(execSync('svn cat "' + specificFilesArr[specificFile] + '" | grep -v ^$ | wc -l').toString());

							str = '\t' + lang + ': [' + count + ']';

							_this.stream.clearLine();
							_this.stream.cursorTo(0);
							_this.stream.write(str);							
						}
					}

					console.log('');

					if (typeof(data[lang]) == 'undefined') {
						data[lang] = count;
					} else {
						data[lang] += count;
					}

					_this.totalLines += count;
				}

				if (index == uriArr.length - 1) {
					callback(data);
				} else {
					_this.statistic(uriArr, callback, data, ++index, line);
				}
			});
		} else {
			_this.getJSON(uriArr[index], function (body) {
				const obj = JSON.parse(body);

				for (var lang in obj) {
					if (typeof(data[lang]) == 'undefined') {
						data[lang] = obj[lang];
					} else {
						data[lang] += obj[lang];
					}

					_this.totalBytes += obj[lang];
				}

				bar.tick(1);

				if (index == uriArr.length - 1) {
					callback(data);
				} else {
					_this.statistic(uriArr, callback, data, ++index, line);
				}
			});
		}
	},

	/**
	 * [calculate start to statistic]
	 * @param  {[type]} userName [the name of the user]
	 * @param  {[type]} filter   [options for filter: all|original]
	 * @param  {[type]} style    [options for style: random|blue]
	 * @param  {[type]} accurate [options for accurate: false|true]
	 * @param  {[type]} line     [options for accurate: false|true]
	 * @return {[type]}          [description]
	 */
	calculate: function (userName, options) {
		if (typeof(userName) == 'undefined') {
			console.log('[Error: miss user name]');
			return;
		}

		if (typeof(options.token) == 'undefined') {
			console.log('[Error: miss github api token]');
			return;
		}

		options.filter = options.filter || 'all';
		options.color = options.color || 'random';
		options.accurate = options.accurate || false;
		options.line = options.line || false;
		options.token = options.token || '';
		options.repo = options.repo || 'all';

		const maxFont = 20;

		var _this = this;
		
		function _convertData(data) {
			if (!options.accurate){
				if (data > 1000000000) {
					return Math.round(data / 1000000000) + 'b';
				}

				if (data > 1000000) {
					return Math.round(data / 1000000) + 'm';
				}

				if (data > 1000) {
					return Math.round(data / 1000) + 'k';
				}

				return data;
			} else {
				const arr = data.toString().split('');

				for (var i = arr.length - 4; i >= 0; i -= 3) {
					arr[i] += ',';
				}

				return arr.join('');
			}
		}

		function _randomColor() {
			if (options.color == 'random' || typeof(_this.colorThemes[options.color]) == 'undefined') {
				return (function(color){
					return (color +=  '0123456789abcdef'[Math.floor(Math.random() * 16)]) && (color.length == 6) ?  color : arguments.callee(color);
				})('');	
			} else {
				return _this.colorThemes[options.color][Math.floor(Math.random() * _this.colorThemes[options.color].length)];
			}
		}

		this.listRepo(userName, function(data) {
			const uriArr = [];

			for (var item in data) {
				if (options.filter == 'original' && data[item].fork == true) {
					continue;
				}

				if (options.filter == 'fork' && data[item].fork == false) {
					continue;
				}

				if (options.repo != 'all' && data[item].name != options.repo) {
					continue;
				}

				if (options.line) {
					uriArr.push({
						'clone_url': data[item].clone_url,
						'svn_url': data[item].svn_url,
						'name': data[item].name,
						'languages_url': data[item].languages_url
					});
				} else {
					uriArr.push(data[item].languages_url + '?access_token=' + options.token);
				}
			}

			if (uriArr.length == 0) {
				console.log('[Error: no such repository]');
				return;
			}

			bar = new progressBar('Calculating: [:bar] :percent :etas', {
				complete: '=',
				incomplete: ' ',
				width: 40,
				total: uriArr.length
			})

			_this.statistic(uriArr, function(data) {
				/** sort */
				const sorted = [];

				for (var lang in data) {
					sorted.push([lang, data[lang]]);
				}

				sorted.sort(function (a, b) {
					return b[1] - a[1];
				});

				/** generate table */
				table.push({
					'User': userName
				});

				if (options.repo != 'all') {
					table.push({
						'Repository': options.repo
					});
				}

				table.push({
					'Number of repositories': uriArr.length
				});

				table.push({
					'Items': [
						'Code Bytes',
						'Code Ratio',
						'Markdown Badges'
					]
				});

				var totalNum = 0;

				if (options.line) {
					totalNum = _this.totalLines;
				} else {
					totalNum = _this.totalBytes;
				}

				table.push({ 
					'Total (bytes)': [
						_convertData(totalNum),
						'100%',
						'![](https://img.shields.io/badge/' + '%20%20Code' + '-' + '%20%20%20%20' + _convertData(totalNum) + '-' + _randomColor() + '.svg)'
					]
				});

				if (options['badges-lists']) {
					console.log('![](https://img.shields.io/badge/' + '%20%20Code' + '-' + '%20%20%20%20' + _convertData(totalNum) + '-' + _randomColor() + '.svg)');
				}

				for (var lang in sorted) {
					var tableItem = {};

					var sheilds = '![](https://img.shields.io/badge/%20%20' + encodeURIComponent(sorted[lang][0]) + '-' + '%20%20%20%20' + _convertData(sorted[lang][1]) + '-' + _randomColor() + '.svg)';

					tableItem[sorted[lang][0]] = [
						_convertData(sorted[lang][1]),
						parseFloat(sorted[lang][1] / totalNum * 100) + '%',
						sheilds
					];

					if (options['badges-lists']) {
						console.log(sheilds);
					}

					table.push(tableItem);
				}

				if (options['badges-lists']) {
					return;
				}

				console.log(table.toString());
			}, {}, 0, options.line);
		}, [], 1, options.token);
	},

	/**
	 * [test: test function of this module]
	 * @return {[type]}    [description]
	 */
	test: function () {
		return execSync('cls -h').toString();
	}
};

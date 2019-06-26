## CLS - Code Lines Statistic within GitHub

![npm](https://aleen42.github.io/badges/src/npm.svg) ![javascript](https://aleen42.github.io/badges/src/javascript.svg) ![](https://img.shields.io/badge/%20%20JavaScript-%20%20%20%20463L-f1e05a.svg) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/aleen42/CLS/master/LICENSE) [![npm](https://img.shields.io/npm/v/cls-cli.svg)](https://www.npmjs.com/package/cls-cli) [![npm](https://img.shields.io/npm/dt/cls-cli.svg)](https://www.npmjs.com/package/cls-cli)

**CLS**, a.k.a remote [**sloc**](https://en.wikipedia.org/wiki/Source_lines_of_code), is a command line tool for Code Statistic of GitHub repositories through different OS platforms. The main advantage of such a tool is that it calculates by only accessing remote repositories without fetching them locally. However, to enhance accessing rate limitation as mentioned on [the official site](https://developer.github.com/v3/auth/#basic-authentication), the tool can only be used with a generated GitHub access token.

*Note: upgrade Subversion to the latest one if you found that SSL handshake failed.*

### Installation

```bash
npm install -g cls-cli
```

### Uninstall

```bash
npm rm -g cls-cli
```

### Usage

Generate access token at first following [here](https://github.com/blog/1509-personal-api-tokens), and then run the command line tool with the token `xxx`:

```bash
cls -u aleen42 -t xxx
```

For more detailed helping on usage, you can run this:

```bash
cls -h
```

Check the version? Just do this:

```bash
cls -v
```

*Note: if you want to have a statistic for code lines, the process will take a long time, because it should connect to remote directory and the speed should depend on your network status and the size of the repository. By the way, there is a bug when your try to have a statistic for a huge repository, which will cause 504 Gate Way timeout error of svn.*

### Debug

The command below will remove global installation and link the command within a local cloned repository. It is helpful for debugging this tool.

```bash
npm run debug
```

### Release History

* ==================== **1.0.0 Initial release** ====================
	* 1.0.0 initial release
	* 1.0.1 update readme
	* 1.0.2 update readme
	* 1.0.3 unused version
	* 1.0.4 unused version
	* 1.0.5 fix bugs
	* 1.0.6 unused version
	* 1.0.7 update test case
	* 1.0.8 update readme
	* 1.0.9 update readme
	* 1.1.0 change lines to bytes
	* 1.1.1 update readme
	* 1.1.2 fix bugs
	* 1.1.3 unused version
	* 1.1.3 test version
* ==================== **2.0.0 Release statistic for lines** ====================
	* 2.0.1 update readme
	* 2.0.2 update readme
	* 2.0.3 update readme
	* 2.0.4 unused version
	* 2.0.5 unused version
	* 2.0.6 unused version
	* 2.0.7 unused version
	* 2.0.8 unused version
	* 2.0.9 unused version
	* 2.1.0 unused version
	* 2.1.1 unused version
	* 2.1.2 unused version
	* 2.1.3 unused version
	* 2.1.4 fix bugs
	* 2.1.5 fix bugs
	* 2.1.6 update readme
	* 2.1.7 update readme
	* 2.1.8 update readme
	* 2.1.9 update readme
	* 2.2.0 update readme
	* 2.2.1 refactor and improve performances when calculating lines

### :fuelpump: How to contribute

Have an idea? Found a bug? See [how to contribute](https://aleen42.github.io/PersonalWiki/contribution.html).

### :scroll: License

[MIT](https://aleen42.github.io/PersonalWiki/MIT.html) © aleen42

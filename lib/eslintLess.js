const R = require('ramda');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const ora = require('ora');
const CLIEngine = require('eslint').CLIEngine;

const { MODE, BASE_DIR, UPDATE_LOG_PATH } = require('./consts');
const formaters = require('./formaters');
const ErrFile = require('./ErrFile');

const eslintLess = {
  mode: MODE.CREATE,
  eslintLog: [],
  fileErrLog: [],
  updateLog: {},

  start() {
    ora().info(`Working at ${BASE_DIR}`);

    return this.init()
      .then(() => this.rewriteFile())
      .then(() => {
        if (this.mode === MODE.CREATE) {
          this.writeFileErrLog();
        } else if (this.mode === MODE.DELETE && fs.existsSync(UPDATE_LOG_PATH)) {
          fs.unlink(UPDATE_LOG_PATH);
        }
      });
  },
  init() {
    return this.initMode()
      .then(() => {
        this.initEslintLog();
        this.initFileErrLog();
        this.initUpdateLog();
      });
  },
  initMode() {
    return new Promise((resolve) => {
      const arg = R.replace('--', '')(process.argv[2] ? process.argv[2] : '');

      switch (arg) {
        case 'create': {
          resolve(MODE.CREATE);
          break;
        }
        case 'delete': {
          resolve(MODE.DELETE);
          break;
        }
        default: {
          resolve(inquirer.prompt([{
            type: 'list',
            name: 'mode',
            message: 'What do you want to do?',
            choices: [
              {
                name: 'create',
                value: MODE.CREATE,
              },
              {
                name: 'delete',
                value: MODE.DELETE,
              },
            ],
            default: 0,
          }]));

          break;
        }
      }
    })
      .then((answer) => {
        this.mode = answer.mode;
      });
  },
  initEslintLog() {
    if (this.mode === MODE.CREATE) {
      const spinner = ora('Eslint testing').start();

      const cli = new CLIEngine({
        cwd: BASE_DIR,
      });
      const report = cli.executeOnFiles(['.']);
      this.eslintLog = CLIEngine.getErrorResults(report.results);

      spinner.succeed('Get eslint log success');
    }
  },
  initFileErrLog() {
    if (this.mode === MODE.CREATE) {
      const spinner = ora('Parsing eslint log');
      try {
        this.fileErrLog = formaters.eslintLogToFileErrLog(this.eslintLog);

        spinner.succeed('Success to parse eslint log');
      } catch (e) {
        spinner.fail('Failed to parse eslint log');
      }
    }
  },
  initUpdateLog() {
    const spinner = ora('Loading update log').start();
    if (fs.existsSync(UPDATE_LOG_PATH)) {
      this.updateLog = JSON.parse(fs.readFileSync(UPDATE_LOG_PATH).toString());
      spinner.succeed('Success to load update log');
    } else {
      spinner.warn('No update log can be found');
    }
  },
  createFileComment() {
    const spinner = ora('Creating inline comment').start();
    const allFiles = [];

    this.fileErrLog.forEach((lintMsg) => {
      const file = new ErrFile(R.merge(lintMsg, {
        spinner,
        mode: MODE.CREATE,
      }));

      allFiles.push(file.start());
    });

    return Promise.all(allFiles)
      .then(() => {
        spinner.succeed('Finish to create inline comment');
      });
  },
  deleteFileComment() {
    const spinner = ora('Deleting inline comment').start();
    const allFiles = [];

    Object.keys(this.updateLog).forEach((relaFilePath) => {
      const file = new ErrFile({
        spinner,
        filePath: path.resolve(BASE_DIR, relaFilePath),
        messages: this.updateLog[relaFilePath],
        mode: MODE.DELETE,
      });

      allFiles.push(file.start());
    });

    return Promise.all(allFiles).then(() => {
      spinner.succeed('Finish to delete inline comment');
    });
  },
  rewriteFile() {
    switch (this.mode) {
      case MODE.CREATE: {
        return this.createFileComment();
      }
      case MODE.DELETE: {
        return this.deleteFileComment();
      }
      default: {
        throw new Error('Mode must be provided by file object!');
      }
    }
  },
  writeFileErrLog() {
    let updateLog = {};
    if (fs.existsSync(UPDATE_LOG_PATH)) {
      updateLog = JSON.parse(fs.readFileSync(UPDATE_LOG_PATH).toString());
    }
    const formatedLog = formaters.fileErrLogToOperationLog(this.fileErrLog);
    updateLog = R.mergeWith(R.compose(R.uniq, R.concat))(updateLog, formatedLog);

    fs.writeFile(UPDATE_LOG_PATH, JSON.stringify(updateLog));
  },
};

module.exports = eslintLess;

const fs = require('fs');
const R = require('ramda');

const { ERR_LEVEL, BOUNDARY_TIP, MODE } = require('./consts');
const formaters = require('./formaters');

class ErrFile {
  constructor(props) {
    const { mode, filePath, messages, spinner } = props;
    this.mode = mode;
    this.filePath = filePath;
    this.messages = messages;

    this.linesData = [];
    this.hasLastRules = false;
    this.rules = {};

    spinner.text = `Rewriting${filePath}`;
  }

  start() {
    return this.init()
      .then(() => {
        switch (this.mode) {
          case MODE.CREATE: {
            this.createComment();
            break;
          }
          case MODE.DELETE: {
            this.deleteComment();
            break;
          }
          default: {
            throw new Error('Mode must be provided by file object!');
          }
        }

        return this.writeFile();
      });
  }
  init() {
    return this.initFile()
      .then(() => {
        this.findLastComment();
      });
  }
  initFile() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.filePath, (err, originData) => {
        if (err) {
          reject(err);
        }

        this.linesData = originData.toString().split('\n');

        resolve();
      });
    });
  }
  findLastComment() {
    const firstLine = this.linesData[0];
    const secondLine = this.linesData[1];

    // find last rules added by this script
    if (firstLine.match(/eslint/) && secondLine.match(BOUNDARY_TIP)) {
      const commentContent = R.trim(firstLine.replace(/\/\*\s*eslint\s*(.*)\s*\*\//, '$1'));

      commentContent.split(/,\s*/).forEach((s) => {
        const sp = s.split(/:\s*/);
        if (sp.length !== 2) {
          console.warn(`Wrong eslint inline comment: ${firstLine}\n  At file: ${filePath}`);
          return;
        }

        this.rules[sp[0]] = Number(sp[1]);
        this.hasLastRules = true;
      });
    }
  }
  createComment() {
    this.messages.forEach((msg) => {
      if (!this.rules[msg]) {
        this.rules[msg] = ERR_LEVEL;
      }
    });

    const rulesComment = formaters.rulesObjToCommentString(this.rules);

    let inlineComment = `/* eslint ${rulesComment} */`;

    if (inlineComment.length >= 100 && R.isNil(this.rules['max-len'])) {
      inlineComment = `/* eslint max-len: 0, ${rulesComment} */`;
    }

    if (this.hasLastRules) {
      this.linesData[0] = inlineComment;
    } else {
      this.linesData.unshift(inlineComment, `/* * * ${BOUNDARY_TIP} * * */`);
    }
  }
  deleteComment() {
    if (this.hasLastRules) {
      this.linesData = formaters.dropTwo(this.linesData);
    }
  }
  writeFile() {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.filePath, this.linesData.join('\n'), (err) => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  }
}

module.exports = ErrFile;

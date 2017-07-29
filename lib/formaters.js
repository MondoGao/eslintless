const path = require('path');
const R = require('ramda');

const { BASE_DIR } = require('./consts');

const formaters = {
  eslintLogToFileErrLog: R.map(R.compose(
    R.over(
      R.lensProp('messages'),
      R.compose(
        R.uniq,
        R.map(R.prop(['ruleId']))
      )
    ),
    R.pick(['filePath', 'messages'])
  )),
  fileErrLogToOperationLog: R.compose(
    R.fromPairs,
    R.map(R.compose(
      R.over(R.lensIndex(0), R.curry(path.relative)(BASE_DIR)),
      R.values
    ))
  ),
  rulesObjToCommentString: R.compose(
    R.join(', '),
    R.map(R.join(': ')),
    R.toPairs),
  dropTwo: R.drop(2),
};

module.exports = formaters;

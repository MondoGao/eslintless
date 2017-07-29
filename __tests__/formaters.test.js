const formaters = require('../lib/formaters');

const eslintLog = [
  {
    filePath: 'path/to/file',
    messages: [
      {
        ruleId: 'rule1',
      },
      {
        ruleId: 'rule2',
      },
      {
        ruleId: 'rule2',
        msg: 'shouldn\'t show',
      },
    ],
  },
];
const fileErrLog = [
  {
    filePath: 'path/to/file',
    messages: ['rule1', 'rule2'],
  },
];
const operationLog = {
  'path/to/file': ['rule1', 'rule2']
};
const rulesObj = {
  rule1: 0,
  rule2: 1,
  rule3: 1,
};
const ruleComment = 'rule1: 0, rule2: 1, rule3: 1';

describe('#eslintLogToFileErrLog', () => {
  test('output should meet the shape', () => {
    expect(formaters.eslintLogToFileErrLog(eslintLog)).toEqual(fileErrLog);
  });
});

describe('#fileErrLogToOperationLog', () => {
  test('output should meet the shape', () => {
    expect(formaters.fileErrLogToOperationLog(fileErrLog)).toEqual(operationLog);
  });
});

describe('#rulesObjToCommentString', () => {
  test('output should meet the shape', () => {
    expect(formaters.rulesObjToCommentString(rulesObj)).toBe(ruleComment);
  });
});

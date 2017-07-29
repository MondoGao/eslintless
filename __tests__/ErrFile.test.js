const ErrFile = require('../lib/ErrFile');

describe('ErrFile', () => {
  const fileProps = {
    mode: 1,
    filePath: 'path/to/file',
    messages: [
      'rule1',
    ],
    spinner: {
      text: 'need to change',
    },
  };

  test('should be a class', () => {
    expect(typeof ErrFile).toBe('function');
    expect(() => (new ErrFile())).toThrow();
    expect(() => (new ErrFile(fileProps))).not.toThrow();
  });
});

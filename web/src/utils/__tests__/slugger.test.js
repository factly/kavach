import { maker, checker, getFileName } from '../sluger';

describe('maker', () => {
  it('returns a lowercased and trimmed string with no special characters', () => {
    const input = '  This is a Test!  ';
    const output = maker(input);

    expect(output).toBe('this-is-a-test');
  });

  it('replaces spaces with dashes', () => {
    const input = 'This is a test';
    const output = maker(input);

    expect(output).toBe('this-is-a-test');
  });

  it('removes multiple dashes', () => {
    const input = 'This  is    a--test';
    const output = maker(input);

    expect(output).toBe('this-is-a-test');
  });

  it('removes leading and trailing dashes', () => {
    const input = '-This is a test-';
    const output = maker(input);

    expect(output).toBe('this-is-a-test');
  });
});

describe('checker', () => {
  it('matches valid strings', () => {
    const input = 'this-is-a-valid-string';
    const output = checker.test(input);

    expect(output).toBe(true);
  });

  it('does not match invalid strings', () => {
    const input = 'This is an invalid string!';
    const output = checker.test(input);

    expect(output).toBe(false);
  });
});

describe('getFileName', () => {
  it('returns a filename with a lowercased, trimmed, and normalized basename', () => {
    const input = ' This is a Test!.png  ';
    const output = getFileName(input);

    expect(output).toBe('this-is-a-test.png');
  });
});

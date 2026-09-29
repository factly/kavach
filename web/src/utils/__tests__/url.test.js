import { safeAppUrl } from '../url';

describe('safeAppUrl', () => {
  it('returns http(s) URLs unchanged', () => {
    expect(safeAppUrl('https://app.factly.in/x')).toBe('https://app.factly.in/x');
    expect(safeAppUrl('http://localhost:3000')).toBe('http://localhost:3000');
  });
  it('rejects script and relative URLs', () => {
    [
      'javascript:alert(1)',
      ' JavaScript:alert(1)',
      'java\tscript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox(1)',
      'app.factly.in',
      '',
      undefined,
      null,
    ].forEach((u) => expect(safeAppUrl(u)).toBeUndefined());
  });
});

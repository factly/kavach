import createForm from '../form';

describe('createForm', () => {
  it('creates a form with the given action and method', () => {
    const form = createForm('http://example.com/', 'post');
    expect(form.action).toBe('http://example.com/');
    expect(form.method).toBe('post');
    expect(form.style.display).toBe('none');
  });
});

import passwordValidation from '../password-validation';

describe('passwordValidation', () => {
  it('returns null for a valid password', () => {
    const input = 'ValidPassword1$';
    const output = passwordValidation(input);

    expect(output).toBeNull();
  });

  it('returns an error string for a password with less than 8 characters', () => {
    const input = 'Passw0@';
    const output = passwordValidation(input);

    expect(output).toBe('Password should have atleast 8 characters');
  });

  it('returns an error string for a password without a lowercase letter', () => {
    const input = 'PASSWORD1$';
    const output = passwordValidation(input);

    expect(output).toBe('Password should have atleast 1 lowercase');
  });

  it('returns an error string for a password without an uppercase letter', () => {
    const input = 'password1$';
    const output = passwordValidation(input);

    expect(output).toBe('Password should have atleast 1 uppercase');
  });

  it('returns an error string for a password without a number', () => {
    const input = 'Password$';
    const output = passwordValidation(input);

    expect(output).toBe('Password should have atleast 1 number');
  });

  it('returns an error string for a password without a special character', () => {
    const input = 'Password1';
    const output = passwordValidation(input);

    expect(output).toBe('Password should have atleast 1 special character');
  });

  it('returns an error string for a password with multiple invalid criteria', () => {
    const input = 'passwo';
    const output = passwordValidation(input);

    expect(output).toBe(
      'Password should have atleast 8 characters 1 uppercase 1 number 1 special character',
    );
  });
});

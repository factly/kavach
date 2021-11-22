export function getErrorMsgByCode(code) {
  switch (code) {
    case 4000007:
      return 'An account with the same email already exists';
    case 4000005:
      return 'The password cannot be used because it is to similar to the user identifier.';
    case 4000006:
      return 'The provided credentials are invalid.';
    case 4000010:
      return 'Account not active yet. Did you forget to verify your email address?';
    default:
      return 'unable to proceed further';
  }
}

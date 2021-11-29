export function getErrorMsgByCode(code) {
  switch (code) {
    case 4000007:
      return 'An account with the same email already exists or please link you github/google ID';
    case 4000005:
      return 'The password cannot be used because it is to similar to the user identifier.';
    case 4000006:
      return 'The provided credentials are invalid.';
    case 4000010:
      return 'Account not active yet. Did you forget to verify your email address?';
    case 4000001:
      return "cannot link already existing OpenID connect connection"
    default:
      return 'unable to proceed further';
  }
}

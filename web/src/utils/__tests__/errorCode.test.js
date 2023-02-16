import { getErrorMsgByCode } from '../errorcode'

describe('getErrorMsgByCode', () => {
	it('should return the correct error message', () => {
		expect(getErrorMsgByCode(4000007)).toBe('An account with the same email already exists or please link you github/google ID')
		expect(getErrorMsgByCode(4000005)).toBe('The password cannot be used because it is to similar to the user identifier.')
		expect(getErrorMsgByCode(4000006)).toBe('The provided credentials are invalid.')
		expect(getErrorMsgByCode(4000010)).toBe('Account not active yet. Did you forget to verify your email address?')
		expect(getErrorMsgByCode(4000001)).toBe('cannot link already existing OpenID connect connection')
		expect(getErrorMsgByCode(1010003)).toBe('Please confirm this action by verifying that it is you.')
		expect(getErrorMsgByCode(1234567)).toBe('unable to proceed further')
	})
})

import applicationData from '../../data/application.json';
import getApplicationSettings from '../getApplicationSettings';

describe('getApplicationSettings', () => {
  beforeAll(() => {
    window.REACT_APP_API_URL = 'https://example.com/api';
    window.REACT_APP_PUBLIC_URL = 'https://example.com';
    window.REACT_APP_LOGO_URL = 'https://example.com/logo.png';
  });

  afterAll(() => {
    delete window.REACT_APP_API_URL;
    delete window.REACT_APP_PUBLIC_URL;
    delete window.REACT_APP_LOGO_URL;
  });

  applicationData.forEach((application) => {
    it('returns the expected object for a matching redirect URL', () => {
      const redirectURL = application.applicationURL;
      const output = getApplicationSettings(redirectURL);

      expect(output).toEqual(application);
    });
  });

  it('returns the default object for a redirect URL that does not match any data in the JSON', () => {
    const redirectURL = 'https://example.com/nonexistent-app';
    const expectedOutput = {
      applicationName: 'FACTLY',
      applicationURL: 'https://example.com',
      applicationLogoURL: 'https://example.com/logo.png',
      enableRegistration: true,
      loginMethod: 'all',
    };
    const output = getApplicationSettings(redirectURL);

    expect(output).toEqual(expectedOutput);
  });

  it('returns the default object if no redirect URL is provided', () => {
    const expectedOutput = {
      applicationName: 'FACTLY',
      applicationURL: 'https://example.com',
      applicationLogoURL: 'https://example.com/logo.png',
      enableRegistration: true,
      loginMethod: 'all',
    };
    const output = getApplicationSettings();

    expect(output).toEqual(expectedOutput);
  });
});

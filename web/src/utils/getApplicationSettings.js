import applicationData from '../data/application.json';

const getApplicationSettings = (redirectURL) => {
  var matchedObject = applicationData.find(
    (applicationData) => applicationData.applicationURL === redirectURL,
  );
  const defaultObj = {
    applicationName: 'FACTLY',
    applicationURL: window.REACT_APP_PUBLIC_URL,
    applicationLogoURL: window.REACT_APP_LOGO_URL,
    enableRegistration: true,
    loginMethod: 'all',
  };
  return matchedObject ? matchedObject : defaultObj;
};

export default getApplicationSettings;

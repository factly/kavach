import kavach_logo from '../assets/kavach.png';
import applicationData from '../data/applicationData.json';

const getApplicationSettings = (redirectURL) => {
  var matchedObject = applicationData.find(
    (applicationData) => applicationData.applicationURL === redirectURL,
  );
  const defaultObj = {
    applicationName: 'Kavach',
    applicationLogoURL: kavach_logo,
    applicationURL: window.REACT_APP_PUBLIC_URL,
    loginMethod: 'all',
    enableRegistration: true,
  };
  return matchedObject ? matchedObject : defaultObj;
};

export default getApplicationSettings;

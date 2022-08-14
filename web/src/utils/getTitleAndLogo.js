import kavach_logo from '../assets/kavach.png';
import dataful_logo from '../assets/dataful.png';
import dega_logo from '../assets/dega.svg'
import applicationData from '../data/applicationData.json';

const getTitleAndLogo = (redirectURL) => {
  var matchedObject = applicationData.filter((applicationData) => applicationData.productionURL === redirectURL || applicationData.developmentURL === redirectURL)
  const defaultObj = {
    name : "Kavach",
    logo: kavach_logo,
    developmentURL:"http://127.0.0.1:4455/.factly/kavach/web/",
    productionURL:"https://login.factly.in/"
  }
  var logo;
  switch(redirectURL){
    case matchedObject.name === "Dataful":
      logo = dataful_logo;
      return {...matchedObject, logo}
    case matchedObject.name === "Dega":
      logo = dega_logo;
      return {...matchedObject, logo}
    default :
    return defaultObj;
  }
}

export default getTitleAndLogo;
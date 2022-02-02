function passwordValidation(value){
    const lowerCase = new RegExp('(?=.*[a-z])')
    const upperCase = new RegExp('(?=.*[A-Z])')
    const number = new RegExp('(?=.*[0-9])')
    const specialChar = new RegExp('(?=.*[!@#/$%/^&/*])')
    const eightChar = new RegExp('(?=.{8,})')
    var errorString = "Password should have atleast"
    var flag = true
    if(!eightChar.test(value)){
        errorString = errorString + " 8 characters"
        flag = false
    }
    if(!lowerCase.test(value)){
        errorString = errorString + " 1 lowercase"
        flag = false
    }
    if(!upperCase.test(value)){
        errorString = errorString + " 1 uppercase"
        flag = false
    }
    if(!number.test(value)){
        errorString = errorString + " 1 number"
        flag = false
    }
    if(!specialChar.test(value)){
        errorString = errorString + " 1 special character"
        flag = false
    }
    if(flag){
        return null
    }
    return errorString
}

export default passwordValidation

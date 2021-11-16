export function emailVerification(email){
    fetch(window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/verification/browser').
    then((res)=>{
        var obj = {}
        res.url
        .split('?')
        .filter((each) => each.trim() !== '')
        .forEach((each) => {
            var temp = each.split('=');
            obj[temp[0]] = temp[1];
        });
        fetch(window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/verification/flows?id=' + obj['flow'])
        .then((res)=>{
            if (res.status === 200) {
                return res.json();
              } else {
                throw new Error(res.status);
              }
        }).then((res)=>{
            sendLink(res.ui, email)
        }).catch((err)=>{
            return false
        })
    })
    return true
}

const sendLink = (ui, email) => {
    var verificationEmailForm = document.createElement('form');
    verificationEmailForm.action = ui.action;
    verificationEmailForm.method = ui.method;
    verificationEmailForm.style.display = 'none';

    var emailInput = document.createElement('input');
    emailInput.name = 'email';
    emailInput.value = email;

    var csrfInput = document.createElement('input');
    csrfInput.name = 'csrf_token';
    csrfInput.value = ui.nodes.find((value) => {
      if (value.attributes.name === 'csrf_token') {
        return value;
      }
    }).attributes.value;

    var methodInput = document.createElement('input');
    methodInput.name = 'method';
    methodInput.value = 'link';

    verificationEmailForm.appendChild(emailInput);
    verificationEmailForm.appendChild(csrfInput);
    verificationEmailForm.appendChild(methodInput);
    document.body.appendChild(verificationEmailForm);
    verificationEmailForm.submit();
    console.log("email sent!")
  };
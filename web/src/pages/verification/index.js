import React from 'react';

function Verification() {
  React.useEffect(() => {
    var obj = {};
    window.location.search
      .split('?')
      .filter((each) => each.trim() !== '')
      .forEach((each) => {
        var temp = each.split('=');
        obj[temp[0]] = temp[1];
      });
    fetch(window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/verification/flows?id=' + obj['flow'])
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then((res) => {
        if (res && res.state === 'passed_challenge') {
          window.location.href = window.PUBLIC_URL + '/auth/login';
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <img
        src={require('../../assets/email-verification.svg')}
        width={200}
        alt="verification"
        style={{ marginBottom: 10 }}
      />
      <h2>Verify your email address.</h2>
      <p style={{ width: '250px' }}>
        An email containing a verification link has been sent to your email address.
      </p>
    </div>
  );
}

export default Verification;

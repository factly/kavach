import React from 'react';
function Verification() {
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
      <img src={require('../../assets/email-verification.svg')} width={200} style={{marginBottom:10}}/>
      <h2>Verify your email address.</h2>
      <p style={{width:'250px'}}>An email containing a verification link has been sent to your email address.</p>
    </div>
  );
}

export default Verification;

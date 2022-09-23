import React from 'react';
import Lottie from 'react-lottie';
import { Link } from 'react-router-dom';
import animationData from './email-sent.json';

function VerificationAfterRegistration() {
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
      <Lottie
        width={'40%'}
        height={'40%'}
        options={{
          loop: true,
          autoplay: true,
          animationData: animationData,
        }}
      />
      <h2>Verify your email address.</h2>
      <p style={{ fontSize: '16px' }}>
        An email containing a verification link has been sent to your email address.
      </p>
      <Link
        to={'/auth/login'}
        style={{
          fontSize: '16px',
        }}
      >
        Go back to login
      </Link>
    </div>
  );
}

export default VerificationAfterRegistration;

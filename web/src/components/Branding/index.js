import React from 'react';
import Lottie from 'react-lottie';
import animationData from './login.json';

const BrandingComponent = () => {
  return (
    <div style={{ width: '50%', background: '#3A54AA', display: 'flex', justifyContent: 'center' }}>
      <Lottie
        options={{
          loop: true,
          autoplay: true,
          animationData: animationData,
        }}
      />
    </div>
  );
};

export default BrandingComponent;

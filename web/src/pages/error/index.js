import React, { useState } from 'react';
import ErrorComponent from '../../components/ErrorsAndImage/ErrorComponent';

function KratosError() {
  const [status, setStatus] = useState('500');
  const [title, setTitle] = useState('Something went wrong. Try after some time.');
  React.useEffect(() => {
    var obj = {};

    window.location.search
      .split('?')
      .filter((each) => each.trim() !== '')
      .forEach((each) => {
        var temp = each.split('=');
        obj[temp[0]] = temp[1];
      });

    fetch(window.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/errors?error=' + obj['id'])
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then((res) => {
        if (res.error.code >= 400 && res.error.code <= 499) {
          setStatus('error');
        }
        setTitle(res.error.message);
      })
      .catch((err) => {
        console.log(err.message);
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
      <ErrorComponent title={title} status={status} link={'/auth/login'} message="Go to Login" />
    </div>
  );
}

export default KratosError;

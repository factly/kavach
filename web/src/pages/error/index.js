import React from 'react';

function KratosError() {
  React.useEffect(() => {
    var obj = {};

    window.location.search
      .split('?')
      .filter((each) => each.trim() !== '')
      .forEach((each) => {
        var temp = each.split('=');
        obj[temp[0]] = temp[1];
      });

    fetch(process.env.REACT_APP_KRATOS_PUBLIC_URL + '/self-service/errors?error=' + obj['error'])
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  return <div className="content">error page</div>;
}

export default KratosError;

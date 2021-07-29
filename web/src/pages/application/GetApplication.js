import React, { useState } from 'react';
import ApplicationDetail from './components/ApplicationDetail';

function GetApplication({ data, setTokenFlag }) {
  const [visible, setVisible] = useState(false);

  return (
    <ApplicationDetail
      data={data}
      visible={visible}
      setVisible={setVisible}
      setTokenFlag={setTokenFlag}
    />
  );
}

export default GetApplication;

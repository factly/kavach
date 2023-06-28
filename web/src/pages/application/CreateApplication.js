import React from 'react';
import ApplicationCreateForm from './components/ApplicationForm';
import { createApplication } from '../../actions/application';
import { getOrganisations } from '../../actions/organisations';
import { Space } from 'antd';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

function CreateApplication() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createApplication(values)).then(() => {
      dispatch(getOrganisations());
      history.push('/applications');
    });
  };
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <div className="application-descriptions-header">
        <div className="application-descriptions-title">
          <h2 className="application-title-main">Create Application</h2>
        </div>
      </div>
      <ApplicationCreateForm onCreate={onCreate} />
    </Space>
  );
}

export default CreateApplication;

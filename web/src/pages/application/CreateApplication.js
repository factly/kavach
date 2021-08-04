import React from 'react';
import ApplicationCreateForm from './components/ApplicationForm';
import { addApplication } from '../../actions/application';
import { getOrganisations } from '../../actions/organisations';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

function CreateApplication() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addApplication(values)).then(() => {
      dispatch(getOrganisations());
      history.push('/applications');
    });
  };
  return <ApplicationCreateForm onCreate={onCreate} />;
}

export default CreateApplication;

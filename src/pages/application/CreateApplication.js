import React from 'react';
import ApplicationCreateForm from './components/ApplicationForm';
import { addApplication } from '../../actions/application';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

function CreateApplication() {
    const history = useHistory();

    const dispatch = useDispatch();
    const onCreate = (values) => {
        dispatch(addApplication(values)).then(() => history.push('/application'));
    };
    return <ApplicationCreateForm onCreate={onCreate} />;
}

export default CreateApplication;
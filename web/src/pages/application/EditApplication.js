import React from 'react';
import ApplicationEditForm from './components/ApplicationForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { updateApplication, getApplication } from '../../actions/application';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';

function EditApplication() {
  const history = useHistory();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { application, loading } = useSelector((state) => {
    return {
      application: state.applications.details[id] ? state.applications.details[id] : null,
      loading: state.applications.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getApplication(id));
  }, [dispatch, id]);

  if (loading && !application) return <Skeleton />;

  const onUpdate = (values) => {
    dispatch(updateApplication({ ...application, ...values })).then(() =>
      history.push('/applications'),
    );
  };
  return <ApplicationEditForm data={application} onCreate={onUpdate} />;
}

export default EditApplication;

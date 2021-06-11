import React from 'react';
import ApplicationDetail from './components/ApplicationDetail';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { getApplication } from '../../actions/application';
import { useParams } from 'react-router-dom';

function GetApplication() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { application, loading } = useSelector((state) => {
    return {
      application: state.application.details[id] ? state.application.details[id] : null,
      loading: state.application.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getApplication(id));
  }, [dispatch, id]);

  if (loading && !application) return <Skeleton />;

  return <ApplicationDetail data={application}  />;
}

export default GetApplication;
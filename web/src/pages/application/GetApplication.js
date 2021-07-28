import React, { useState } from 'react';
import ApplicationDetail from './components/ApplicationDetail';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { getApplication } from '../../actions/application';
import { useParams } from 'react-router-dom';

function GetApplication() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const { application, loading } = useSelector((state) => {
    return {
      application: state.applications.details[id] ? state.applications.details[id] : null,
      loading: state.applications.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getApplication(id));
  }, [dispatch, id, visible]);

  if (loading && !application) return <Skeleton />;

  return <ApplicationDetail data={application} visible={visible} setVisible={setVisible} />;
}

export default GetApplication;

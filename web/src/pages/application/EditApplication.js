import React from 'react';
import ApplicationEditForm from './components/ApplicationForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton, Space } from 'antd';
import { updateApplication, getApplication, getApplications } from '../../actions/application';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import ErrorComponent from '../../components/ErrorsAndImage/ErrorComponent';

function EditApplication() {
  const history = useHistory();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { application, loadingApp, role, loadingRole, orgID } = useSelector((state) => {
    return {
      application: state.applications.details[id] ? state.applications.details[id] : null,
      loadingApp: state.applications.loading,
      role: state.profile.roles[state.organisations.selected],
      loadingRole: state.profile.loading,
      orgID: state.organisations.selected,
    };
  });
  React.useEffect(() => {
    dispatch(getApplication(id));
  }, [dispatch, id]);

  if (loadingApp || loadingRole) return <Skeleton />;

  if (role === 'member') {
    return (
      <ErrorComponent
        status="403"
        title="Sorry you are not authorised to access this page"
        link="/organisation"
        message="Back Home"
      />
    );
  }

  const onUpdate = (values) => {
    dispatch(updateApplication({ ...application, ...values })).then(() => {
      dispatch(getApplications());
      history.push('/applications');
    });
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {!application.is_default ? (
        <>
          <div className="application-descriptions-header">
            <div className="application-descriptions-title">
              <h2 className="application-title-main">Edit Application</h2>
            </div>
          </div>
          <ApplicationEditForm data={application} onCreate={onUpdate} />
        </>
      ) : orgID === 1 ? (
        <>
          <div className="application-descriptions-header">
            <div className="application-descriptions-title">
              <h2 className="application-title-main">Edit Application</h2>
            </div>
          </div>
          <ApplicationEditForm data={application} onCreate={onUpdate} />
        </>
      ) : (
        <>
          <ErrorComponent
            status="403"
            title="Sorry you are not authorised to access this page"
            link="/applications"
            message="Goto Applications"
          />
        </>
      )}
    </Space>
  );
}

export default EditApplication;

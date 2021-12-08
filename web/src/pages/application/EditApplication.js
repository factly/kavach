import React from 'react';
import ApplicationEditForm from './components/ApplicationForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton, Space, Collapse } from 'antd';
import { updateApplication, getApplication } from '../../actions/application';
import { getOrganisations } from '../../actions/organisations';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import GetApplication from './GetApplication';
import ApplicationUsers from './users/index';
import ErrorComponent from '../../components/ErrorsAndImage/ErrorComponent';

function EditApplication() {
  const history = useHistory();
  const { id } = useParams();
  const { Panel } = Collapse;
  const dispatch = useDispatch();
  const [tokenFlag, setTokenFlag] = React.useState(false);
  const { application, loadingApps, userDetails, loadingUsers, userID, loadingID } = useSelector(
    (state) => {
      return {
        application: state.applications.details[id] ? state.applications.details[id] : null,
        loadingApps: state.applications.loading,
        userDetails: state.users.details,
        loadingUsers: state.users.loading,
        userID: state.profile.details.id,
        loadingID: state.profile.loading,
      };
    },
  );

  React.useEffect(() => {
    dispatch(getApplication(id));
  }, [dispatch, id, tokenFlag]);

  if (loadingApps && !application && loadingUsers && loadingID) return <Skeleton />;

  if (!loadingUsers) {
    if (userDetails[userID].permission.role) {
      return (
        <ErrorComponent
          status="403"
          title="Sorry you are not authorised to access this page"
          link="/organisation"
          message="Back Home"
        />
      );
    }
  }

  const onUpdate = (values) => {
    dispatch(updateApplication({ ...application, ...values })).then(() => {
      dispatch(getOrganisations());
      history.push('/applications');
    });
  };
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Collapse defaultActiveKey="1">
        <Panel header="Application Details" key="1">
          <ApplicationEditForm data={application} onCreate={onUpdate} />
        </Panel>
      </Collapse>
      <Collapse defaultActiveKey="3">
        <Panel header="Users" key="3">
          <ApplicationUsers id={id} />
        </Panel>
      </Collapse>
      <Collapse defaultActiveKey="2">
        <Panel header="Tokens" key="2">
          <GetApplication setTokenFlag={setTokenFlag} data={application} />
        </Panel>
      </Collapse>
    </Space>
  );
}

export default EditApplication;

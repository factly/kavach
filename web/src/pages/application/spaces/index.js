import React from 'react';
import SpaceList from './SpaceList';
import { Button, Select, Skeleton, Space } from 'antd';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getApplications } from '../../../actions/application';
import { setSelectedApp } from '../../../actions/space';

function Spaces() {
  const dispatch = useDispatch();
  React.useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const fetchApplications = () => {
    dispatch(getApplications());
  };

  const { applications, selectedApp, loading, role } = useSelector((state) => {
    return {
      applications: state.organisations.details[state.organisations.selected]?.application_ids
        ? state.organisations.details[state.organisations.selected]?.application_ids.map(
            (id) => state.applications.details[id],
          )
        : [],
      selectedApp: state.spaces.selected,
      loading: state.applications.loading,
      role: state.organisations.role,
      loadingRole: state.organisations.loading,
    };
  });
  const [appID, setappID] = React.useState(loading ? null : selectedApp);
  const onApplicationChange = (value, key) => {
    setappID(parseInt(key.key, 10));
    dispatch(setSelectedApp(parseInt(key.key, 10)));
  };

  return (
    <Space direction="vertical">
      {loading ? (
        <Skeleton />
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '76vw',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <h3> Application</h3>
            <Select
              style={{ width: '150px', marginLeft: 10 }}
              placeholder="choose application"
              onChange={(value, key) => onApplicationChange(value, key)}
              defaultValue={
                selectedApp === null
                  ? ''
                  : applications.filter((app) => app.id === selectedApp)[0]?.name
              }
            >
              {applications.map((application) => {
                return (
                  <Select.Option value={application.name} key={application.id}></Select.Option>
                );
              })}
            </Select>
          </div>
          {role === 'owner' ? (
            <Link to={`/applications/${appID}/spaces/create`}>
              <Button type="primary" disabled={!appID}>
                Create Space
              </Button>
            </Link>
          ) : null}
        </div>
      )}
      {appID ? <SpaceList appID={appID} role={role} /> : null}
    </Space>
  );
}

export default Spaces;

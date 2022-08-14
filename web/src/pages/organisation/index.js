import React from 'react';
import { Skeleton, Descriptions, Space, Divider, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getOrganisations } from './../../actions/organisations';
import OrganisationSettings from './settings';
import { EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import ErrorComponent from '../../components/ErrorsAndImage/ErrorComponent';
import Metric from '../../components/Settings/metric';

function OrganisationDetails() {
  const dispatch = useDispatch();
  const descriptionSpan = 3;
  const { organisation, loading, selected, orgCount, role } = useSelector((state) => {
    return {
      organisation: state.organisations.details[state.organisations.selected],
      loading: state.organisations.loading,
      selected: state.organisations.selected,
      orgCount: state.organisations && state.organisations.ids ? state.organisations.ids.length : 0,
      role: state.profile.roles[state.organisations.selected],
    };
  });

  React.useEffect(() => {
    dispatch(getOrganisations());
    //eslint-disable-next-line
  }, []);

  return (
    <div>
      {loading ? (
        <Skeleton />
      ) : orgCount === 0 ? (
        <ErrorComponent
          status="403"
          title="You have 0 organisations. To access this page please create an organisation"
          link="/organisation/create"
          message="Create Organisation"
        />
      ) : (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Descriptions
            title={<h2> Manage organisation </h2>}
            bordered={true}
            extra={
              <Link to={`/organisation/edit`}>
                <Button icon={<EditOutlined />} type="primary">
                  Edit Organisation
                </Button>
              </Link>
            }
          >
            <Descriptions.Item label="Name" span={descriptionSpan}>
              {organisation?.title}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={descriptionSpan}>
              {organisation?.description}
            </Descriptions.Item>
            <Descriptions.Item label="Permissions" span={descriptionSpan}>
              {role}
            </Descriptions.Item>
            <Descriptions.Item label="Number of applications" span={descriptionSpan}>
              {organisation?.applications?.length}
            </Descriptions.Item>
          </Descriptions>
          <Divider> Organisation Settings</Divider>
          <OrganisationSettings orgID={selected} />
        </Space>
      )}
    </div>
  );
}

export default OrganisationDetails;

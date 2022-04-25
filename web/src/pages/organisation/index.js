import React from 'react';
import { Skeleton, Descriptions, Space, Divider, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getOrganisations } from './../../actions/organisations';
import OrganisationSettings from './settings';
import { EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

function OrganisationDetails() {
  const dispatch = useDispatch();
  const descriptionSpan = 3;
  const { organisation, loading, selected } = useSelector((state) => {
    return {
      organisation: state.organisations.details[state.organisations.selected],
      loading: state.organisations.loading,
      selected: state.organisations.selected,
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
      ) : (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Descriptions
            title={<h2> Manage organisation </h2>}
            bordered={true}
            extra={
              <Link to={`/organisation/edit`}>
                <Button icon={<EditOutlined />} type="primary">
                  {' '}
                  Edit Organisation{' '}
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
              {organisation?.permission?.role}
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

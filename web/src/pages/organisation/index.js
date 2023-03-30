import React, { useEffect } from 'react';
import { Skeleton, Descriptions, Space, Divider, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getOrganisations } from './../../actions/organisations';
import OrganisationSettings from './settings';
import { EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import '../../styles/organisation.css';
import ErrorComponent from '../../components/ErrorsAndImage/ErrorComponent';

function OrganisationDetails() {
  const dispatch = useDispatch();
  const descriptionSpan = 10;
  const { organisation, loading, selected, orgCount, role } = useSelector((state) => {
    return {
      organisation: state.organisations.details[state.organisations.selected],
      loading: state.organisations.loading,
      selected: state.organisations.selected,
      orgCount: state.organisations && state.organisations.ids ? state.organisations.ids.length : 0,
      role: state.profile.roles[state.organisations.selected],
    };
  });

  useEffect(() => {
    dispatch(getOrganisations());
    //eslint-disable-next-line
  }, []);

  return (
    <>
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
        <Space direction="vertical">
          <Descriptions
            className="organisation-index"
            title={<h2 className="organisation-title-main">Manage organisation</h2>}
            bordered={true}
            extra={
              <Link to={`/organisation/edit`}>
                <Button icon={<EditOutlined />} type="primary">
                  Edit Organisation
                </Button>
              </Link>
            }
          >
            <Descriptions.Item
              label={<div className="organisation-table-label">Name</div>}
              span={descriptionSpan}
            >
              {organisation?.title}
            </Descriptions.Item>
            <Descriptions.Item
              label={<div className="organisation-table-label">Description</div>}
              span={descriptionSpan}
            >
              {organisation?.description}
            </Descriptions.Item>
            <Descriptions.Item
              label={<div className="organisation-table-label">Permissions</div>}
              span={descriptionSpan}
            >
              {role}
            </Descriptions.Item>
            <Descriptions.Item
              label={<div className="organisation-table-label">Number of applications</div>}
              span={descriptionSpan}
            >
              {organisation?.applications?.length}
            </Descriptions.Item>
          </Descriptions>

          <Descriptions
            style={{ marginTop: '34px' }}
            title={<h2 className="organisation-title-main">Organisation Settings</h2>}
          ></Descriptions>
          <OrganisationSettings orgID={selected} />
        </Space>
      )}
    </>
  );
}

export default OrganisationDetails;

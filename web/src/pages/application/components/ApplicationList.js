import React from 'react';
import { Popconfirm, Button, Table, Skeleton, Space, Avatar, Tooltip, Card, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getApplications, deleteApplication } from '../../../actions/application';
import { getOrganisations } from '../../../actions/organisations';
import { Link } from 'react-router-dom';

function ApplicationList() {
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 5,
  });
  const { applications, loading, total } = useSelector((state) => {
    const node = state.applications.req[0];

    if (node)
      return {
        applications: node.data.map((element) => state.applications.details[element]),
        loading: state.applications.loading,
        total: node.total,
      };
    return { applications: [], loading: state.applications.loading, total: 0 };
  });

  React.useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const fetchApplications = () => {
    dispatch(getApplications());
  };
  let applicationList = [];
  const ApplicationCard = (props) => {
    return (
      <Card
        hoverable
        loading={loading}
        style={{ width: 280, marginTop: 10 }}
        cover={
          loading ? (
            <Card loading={true}></Card>
          ) : (
            <img
              alt="example"
              src={
                props.application.medium && props.application.medium_id
                  ? props.application.medium.url.proxy
                  : 'https://cdn5.vectorstock.com/i/thumb-large/99/49/bold-mid-century-abstract-drawing-vector-28919949.jpg'
              }
            />
          )
        }
        actions={[
          <Link
            to={loading ? '' : `/applications/${props.application.id}/edit`}
            className="ant-dropdown-link"
          >
            <EditOutlined key="edit" />
          </Link>,
          <Popconfirm
            title="Sure to Delete?"
            onConfirm={() =>
              dispatch(deleteApplication(props.application.id)).then(() => {
                dispatch(getOrganisations());
                fetchApplications();
              })
            }
          >
            <Link to="" className="ant-dropdown-link">
              <DeleteOutlined />
            </Link>
          </Popconfirm>,
          <a href={props.application.url}>
            <DeleteOutlined />
          </a>,
        ]}
      >
        <Card.Meta
          title={loading ? '' : props.application.name}
          description={loading ? '' : props.application.description}
          style={{ textAlign: 'center' }}
        />
      </Card>
    );
  };

  const ApplicationRow = (props) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 50 }}>
        {props.applications.map((application, index) => (
          <ApplicationCard key={index} application={application}></ApplicationCard>
        ))}
      </div>
    );
  };
  if (loading) {
    return <Skeleton />;
  } else {
    for (var i = 0; i < Math.ceil(applications.length / 3); i++) {
      applicationList.push(applications.slice(3 * i, 3 * i + 3));
    }
  }
  return (
    <Space direction="vertical">
      {applicationList.map((applicationRow, index) => (
        <ApplicationRow key={index} applications={applicationRow} />
      ))}
    </Space>
  );
}

export default ApplicationList;

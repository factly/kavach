import React from 'react';
import OrganizationUsers from './components/users';
import { Card, List, Button, Form, Input, Popconfirm, Divider, Modal } from 'antd';
import { DeleteOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons';

function Organizations() {
  const [organizations, setOrganizations] = React.useState([]);
  const [edit, setEdit] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + '/organizations/my')
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then((res) => setOrganizations(res))
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const updateOrg = (values, id) => {
    fetch(process.env.REACT_APP_API_URL + '/organizations/' + id, {
      method: 'PUT',
      body: JSON.stringify(values),
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then((res) => {
        var updateIndex = organizations.findIndex((item) => item.id === id);
        if (updateIndex > -1) {
          var newData = organizations;
          newData[updateIndex] = res;
          setOrganizations(newData);
          setEdit(null);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deleteOrg = (id) => {
    setLoading(true);
    fetch(process.env.REACT_APP_API_URL + '/organizations/' + id, {
      method: 'DELETE',
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then((res) => {
        var deleteIndex = organizations.findIndex((item) => item.id === id);
        if (deleteIndex > -1) {
          var newData = organizations;
          newData.splice(deleteIndex, 1);

          setOrganizations(newData);
        }
      })
      .catch((err) => {
        console.log(err);
      });
    setLoading(false);
  };

  const addOrg = (values) => {
    setLoading(true);
    fetch(process.env.REACT_APP_API_URL + '/organizations/', {
      method: 'POST',
      body: JSON.stringify(values),
    })
      .then((res) => {
        if (res.status === 201) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then((res) => {
        var newData = organizations;
        newData.push(res);
        setOrganizations(newData);
      })
      .catch((err) => {
        console.log(err);
      });
    setLoading(false);
    setShowModal(false);
  };

  return (
    <div className="content">
      <div id="add-organization">
        <Button type="primary" onClick={() => setShowModal(true)}>
          Add Organization
        </Button>
        <Modal
          title="Add Organization"
          visible={showModal}
          onCancel={() => setShowModal(false)}
          footer={[
            <Button key="back" onClick={() => setShowModal(false)}>
              Cancel
            </Button>,
            <Button form="organization_new" key="submit" htmlType="submit" type="primary">
              Submit
            </Button>,
          ]}
        >
          <Form name="organization_new" onFinish={(values) => addOrg(values)}>
            <Form.Item name="title" label="Title">
              <Input placeholder="title" />
            </Form.Item>
            <Form.Item name="slug" label="Slug">
              <Input placeholder="slug" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
      <div id="organization-list">
        <List
          loading={loading}
          grid={{ gutter: 16, column: 3 }}
          dataSource={organizations}
          itemLayout="vertical"
          renderItem={(item) => (
            <List.Item key={item.id}>
              <Card
                title={
                  item.id === edit ? (
                    <Form
                      name="organization_edit"
                      layout="inline"
                      onFinish={(values) => updateOrg(values, item.id)}
                      initialValues={{
                        title: item.title,
                      }}
                    >
                      <Form.Item name="title">
                        <Input placeholder="title" />
                      </Form.Item>
                      <Form.Item>
                        <Button form="organization_edit" type="primary" htmlType="submit" block>
                          Save
                        </Button>
                      </Form.Item>
                    </Form>
                  ) : (
                    item.title
                  )
                }
                extra={
                  item.permission.role === 'owner' ? (
                    <div>
                      <Button
                        icon={item.id === edit ? <CloseOutlined /> : <EditOutlined />}
                        onClick={() => (item.id === edit ? setEdit(null) : setEdit(item.id))}
                      />
                      <Divider type="vertical" />
                      <Popconfirm title="Sure to delete?" onConfirm={() => deleteOrg(item.id)}>
                        <Button icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </div>
                  ) : null
                }
              >
                <OrganizationUsers organization={item} />
              </Card>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
}

export default Organizations;

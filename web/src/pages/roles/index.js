import React from 'react';
import { Collapse, Form, Tabs } from 'antd';
import FormComponent from './components/RolesForm';
import RolesList from './components/RolesList';
import { useDispatch } from 'react-redux';
import {
  getOrganisationRoles,
  getApplicationRoles,
  getSpaceRoles,
  createOrganisationRole,
  createApplicationRole,
  createSpaceRole,
} from '../../actions/roles';

function Roles() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const onSubmit = (value, type) => {
    const reqBody = {
      name: value.name,
      description: value.description,
      slug: value.slug,
    };

    switch (type) {
      case 'organisation':
        dispatch(createOrganisationRole(reqBody)).then(() => dispatch(getOrganisationRoles()));
        break;
      case 'application':
        dispatch(createApplicationRole(value.application, reqBody)).then(() =>
          getApplicationRoles(value.application),
        );
        break;
      case 'space':
        dispatch(createSpaceRole(value.application, value.space, reqBody)).then(() =>
          dispatch(getSpaceRoles(value.application, value.space)),
        );
        break;
      default:
        return;
    }
    form.resetFields();
  };

  return (
    <Collapse>
      <Collapse.Panel header=" Create Roles">
        <Tabs centered={true}>
          <Tabs.TabPane tab="Organisation roles" key="1">
            <FormComponent form={form} onSubmit={onSubmit} type="organisation" />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Application roles" key="2">
            <FormComponent form={form} onSubmit={onSubmit} type="application" />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Space roles" key="3">
            <FormComponent form={form} onSubmit={onSubmit} type="space" />
          </Tabs.TabPane>
        </Tabs>
      </Collapse.Panel>
      <Collapse.Panel header=" View Roles">
        <Tabs centered={true}>
          <Tabs.TabPane tab="Organisation roles" key="1">
            <RolesList type="organisation" />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Application roles" key="2">
            <RolesList type="application" />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Space roles" key="3">
            <RolesList type="space" />
          </Tabs.TabPane>
        </Tabs>
      </Collapse.Panel>
    </Collapse>
  );
}

export default Roles;

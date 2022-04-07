import React from 'react';
import { Tabs, Form, Collapse } from 'antd';
import PolicyList from './components/PolicyList';
import PolicyForm from './components/PolicyForm';
import { createApplicationPolicy, createOrganisationPolicy, createSpacePolicy, getApplicationPolicy, getOrganisationPolicy, getSpacePolicy } from '../../actions/policy';
import { useDispatch } from 'react-redux';

function Policy() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const onSubmit = (value, type) => {  
      switch (type) {
        case 'organisation':
          dispatch(createOrganisationPolicy(value)).then(() => dispatch(getOrganisationPolicy()));
          break;
        case 'application':
          dispatch(createApplicationPolicy(value.application, value)).then(() =>
            getApplicationPolicy(value.application),
          );
          break;
        case 'space':
          dispatch(createSpacePolicy(value.application, value.space, value)).then(() =>
            dispatch(getSpacePolicy(value.application, value.space)),
          );
          break;
        default:
          return;
      }
      form.resetFields();
    };

  return (
    <Collapse>
      <Collapse.Panel header="Create Policy">
        <Tabs centered={true}>
          <Tabs.TabPane tab="Organisation Policy" key="1">
            <PolicyForm type="organisation" onSubmit={onSubmit} form={form}/>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Application " key="2">
            <PolicyForm type="application" onSubmit={onSubmit} form={form}/>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Space Policy" key="3">
            <PolicyForm type="space" onSubmit={onSubmit} form={form}/>
          </Tabs.TabPane>
        </Tabs>
      </Collapse.Panel>
      <Collapse.Panel header="View Policy">
        <Tabs centered={true}>
          <Tabs.TabPane tab="Organisation Policy" key="1">
            <PolicyList type="organisation" />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Application Policy" key="2">
            <PolicyList type="application" />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Space Policy" key="3">
            <PolicyList type="space" />
          </Tabs.TabPane>
        </Tabs>
      </Collapse.Panel>
    </Collapse>
  );
}

export default Policy;

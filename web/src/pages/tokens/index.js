import React from 'react';
import { Tabs, Form, Collapse } from 'antd';
import FormComponent from './components/TokenForm';
import TokenList from './components/TokenList';
import {
  addOrganisationToken,
  getOrganisationTokens,
  addApplicationToken,
  getApplicationTokens,
  addSpaceToken,
  getSpaceTokens,
} from '../../actions/token';
import { useDispatch } from 'react-redux';

function Token() {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { Panel } = Collapse;
  const onSubmit = (values, type) => {
    switch (type) {
      case 'organisation':
        dispatch(addOrganisationToken(values)).then(() => 
          dispatch(getOrganisationTokens())
        );
        break;
      case 'application':
        dispatch(addApplicationToken(values)).then(() => 
          getApplicationTokens(values.application)
        );
        break;
      case 'space':
        dispatch(addSpaceToken(values)).then(() =>
          dispatch(getSpaceTokens(values.application, values.space)),
        );
        break;
      default:
        return;
    }
    form.resetFields();
  };

  return (
    <Collapse>
      <Panel header="Create Tokens">
        <Tabs centered={true}>
          <Tabs.TabPane tab="Organisation Token" key="1">
            <FormComponent type="organisation" onSubmit={onSubmit} form={form} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Application Token" key="2">
            <FormComponent type="application" onSubmit={onSubmit} form={form} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Space Token" key="3">
            <FormComponent type="space" onSubmit={onSubmit} form={form} />
          </Tabs.TabPane>
        </Tabs>
      </Panel>
      <Panel header="View Tokens">
        <Tabs centered={true}>
          <Tabs.TabPane tab="Organisation Token" key="1">
            <TokenList type="organisation" />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Application Token" key="2">
            <TokenList type="application" />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Space Token" key="3">
            <TokenList type="space" />
          </Tabs.TabPane>
        </Tabs>
      </Panel>
    </Collapse>
  );
}

export default Token;

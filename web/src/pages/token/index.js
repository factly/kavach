import React from 'react';
import { Tabs, Form } from 'antd';
import FormComponent from './components/TokenForm';
import TokenList from './components/TokenList';
import { addOrganisationToken, getOrganisationTokens } from '../../actions/token';
import { useDispatch } from 'react-redux';

function Token() {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const onSubmit = (values, type) => {
    switch (type) {
      case 'organisation':
        dispatch(addOrganisationToken(values)).then(() => getOrganisationTokens());
        break;
      default:
        return;
    }
    form.resetFields();
  };

  return (
    <Tabs centered={true}>
      <Tabs.TabPane tab="Organisation Token" key="1">
        <FormComponent type="organisation" onSubmit={onSubmit} form={form} />
        <TokenList type="organisation" />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Application Token" key="2">
        <FormComponent type="application" onSubmit={onSubmit} form={form} />
        <TokenList type="application" />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Space Token" key="3">
        <FormComponent type="space" onSubmit={onSubmit} form={form} />
        <TokenList type="space" />
      </Tabs.TabPane>
    </Tabs>
  );
}

export default Token;

import React from 'react';
import { Tabs, Form, Collapse } from 'antd';
import PolicyList from './components/PolicyList';
import PolicyForm from './components/PolicyForm';

function Policy() {
  const onSubmit = (value) => {
  };
  return (
    <Collapse>
      <Collapse.Panel header="Create Policy">
        <Tabs centered={true}>
          <Tabs.TabPane tab="Organisation Policy" key="1">
            <PolicyForm type="organisation" onSubmit={onSubmit} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Application " key="2">
            <PolicyForm type="organisation" onSubmit={onSubmit} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Space Policy" key="3">
            <PolicyForm type="organisation" onSubmit={onSubmit} />
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

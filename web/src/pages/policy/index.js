import React from 'react';
import { Tabs, Form, Collapse } from 'antd';

function Policy() {
  return (
    <Collapse>
      <Collapse.Panel header=" Create Roles">
        <Tabs centered={true}>
          <Tabs.TabPane tab="Organisation Roles" key="1"></Tabs.TabPane>
          <Tabs.TabPane tab="Application Roles" key="2"></Tabs.TabPane>
          <Tabs.TabPane tab="Space Roles" key="3"></Tabs.TabPane>
        </Tabs>
      </Collapse.Panel>
      <Collapse.Panel header=" View Roles">
        <Tabs centered={true}>
          <Tabs.TabPane tab="Organisation Roles" key="1"></Tabs.TabPane>
          <Tabs.TabPane tab="Application Roles" key="2"></Tabs.TabPane>
          <Tabs.TabPane tab="Space Roles" key="3"></Tabs.TabPane>
        </Tabs>
      </Collapse.Panel>
    </Collapse>
  );
}

export default Policy;

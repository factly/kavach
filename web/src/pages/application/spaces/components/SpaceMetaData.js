import React from 'react';
import { Form, Select } from 'antd';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { jsonLanguage } from '@codemirror/lang-json';
import { htmlLanguage } from '@codemirror/lang-html';

function SpaceMetadata() {
  const [modeHeader, setHeaderMode] = React.useState('html');
  const [modeFooter, setFooterMode] = React.useState('html');
  const [modeMetaData, setMetaDataMode] = React.useState('json');

  // selector handlers
  const onHeaderChange = (value) => setHeaderMode(value);
  const onFooterChange = (value) => setFooterMode(value);
  const onMetaDataChange = (value) => setMetaDataMode(value);

  // example code sample
  const htmlSample = `
    <html>
      <head>
      </head>
      <body>
        <div>
          Example HTML
        </div>
      </body>
    </html>
  `;

  const jsonSample = `
    {
      "factly": "kavach",
      "example": "string"
    }
  `;
  return (
    <div>
      <Form.Item
        label="Header Code"
        name="header_code"
        rules={
          modeHeader === 'json'
            ? [
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    try {
                      JSON.parse(value);
                      return Promise.resolve();
                    } catch (error) {
                      return Promise.reject('Invalid JSON format: ', error);
                    }
                  },
                }),
              ]
            : []
        }
      >
        <CodeMirror
          value=""
          placeholder={modeHeader === 'html' ? htmlSample : jsonSample}
          height="100%"
          theme={oneDark}
          extensions={[modeHeader === 'json' ? jsonLanguage : htmlLanguage]}
          autoFocus={true}
        />
      </Form.Item>
      <Select style={{ width: 120 }} defaultValue="html" onChange={onHeaderChange}>
        <Select.Option value="json">JSON</Select.Option>
        <Select.Option value="html">HTML</Select.Option>
      </Select>
      <Form.Item
        label="Footer Code"
        name="footer_code"
        rules={
          modeFooter === 'json'
            ? [
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    try {
                      JSON.parse(value);
                      return Promise.resolve();
                    } catch (error) {
                      return Promise.reject('Invalid JSON format: ', error);
                    }
                  },
                }),
              ]
            : []
        }
      >
        <CodeMirror
          value=""
          placeholder={modeFooter === 'html' ? htmlSample : jsonSample}
          height="100%"
          theme={oneDark}
          extensions={[modeFooter === 'json' ? jsonLanguage : htmlLanguage]}
          autoFocus={true}
        />
      </Form.Item>
      <Select style={{ width: 120 }} defaultValue="html" onChange={onFooterChange}>
        <Select.Option value="json">JSON</Select.Option>
        <Select.Option value="html">HTML</Select.Option>
      </Select>
      <Form.Item
        name="meta_fields"
        label="Meta Data"
        rules={
          modeMetaData === 'json'
            ? [
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    try {
                      JSON.parse(value);
                      return Promise.resolve();
                    } catch (error) {
                      return Promise.reject('Invalid JSON format: ', error);
                    }
                  },
                }),
              ]
            : []
        }
      >
        <CodeMirror
          value=""
          placeholder={modeMetaData === 'html' ? htmlSample : jsonSample}
          height="100%"
          theme={oneDark}
          extensions={[modeMetaData === 'json' ? jsonLanguage : htmlLanguage]}
          autoFocus={true}
        />
      </Form.Item>
      <Select style={{ width: 120 }} defaultValue="json" onChange={onMetaDataChange}>
        <Select.Option value="json">JSON</Select.Option>
        <Select.Option value="html">HTML</Select.Option>
      </Select>
    </div>
  );
}

export default SpaceMetadata;

import React from 'react';
import { Form, Select, Skeleton, Card, Button, Space } from 'antd';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { jsonLanguage } from '@codemirror/lang-json';
import { htmlLanguage } from '@codemirror/lang-html';
import {  useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { editSpace, getSpaceByID } from '../../../../../../../actions/space';

function SpaceMetadata() {
  const [form] = Form.useForm();
  const { appID, spaceID } = useParams();
  const dispatch = useDispatch();
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

  React.useEffect(() => {
    dispatch(getSpaceByID(appID, spaceID));
    //eslint-disable-next-line
  }, [appID, spaceID]);

  const { space, loading } = useSelector((state) => {
    return {
      space: state.spaces.details[spaceID],
      loading: state.spaces.loading,
    };
  });

  const handleSubmit = (data) => {
    const reqBody = { ...space, ...data };
    reqBody.users = null;
    dispatch(editSpace(spaceID, appID, reqBody));
  };

  return (
    <div>
      {loading ? (
        <Skeleton />
      ) : (
        <Card title="Edit Metadata details" style={{ width: '50%' }}>
          <Form
            name="space-metadata-details"
            form={form}
            initialValues={{
              ...space,
              meta_fields: space.meta_fields ? JSON.stringify(space.meta_fields) : '',
            }}
            onFinish={handleSubmit}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
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
              <Form.Item>
                <Button type="primary" htmlType="submit" form="space-metadata-details" block>
                  Submit
                </Button>
              </Form.Item>
            </Space>
          </Form>
        </Card>
      )}
    </div>
  );
}

export default SpaceMetadata;

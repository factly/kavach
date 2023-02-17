import React from 'react';
import { mount, render, shallow } from 'enzyme';
import {
	UserOutlined
} from '@ant-design/icons';
import { SettingsCard } from './index';
import { BrowserRouter as Router } from 'react-router-dom';
import SettingsList from './index';


describe('SettingsCard', () => {
	it('should render and match snapshot with props passed', () => {
		const wrapper = shallow(
			<SettingsCard
				icon={<UserOutlined style={{ color: '#4E89FF' }} />}
				title="Users"
				description="User settings"
			/>
		);
		expect(wrapper).toMatchSnapshot();
	});
});

describe('SettingsList', () => {
	jest.mock('react-router-dom', () => ({
		...jest.requireActual('react-router-dom'),
		useHistory: jest.fn(),
	}));
	it('should render and match snapshot with props passed', () => {
		const wrapper = shallow(
			<Router>
				<SettingsList
					type="organisation"
					orgID="1"
					appID="1"
					spaceID="1"
					role="admin"
				/>
			</Router>
		);
		expect(wrapper).toMatchSnapshot();
	});

	it('should make link to organisation settings', () => {
		const wrapper = render(
			<Router>
				<SettingsList
					type="organisation"
					orgID="1"
					appID="1"
					spaceID="1"
					role="admin"
				/>
			</Router>
		);
		const links = wrapper.find('a');
		Array.from(links).forEach((link) => {
			expect(link.attribs.href).toContain('/organisation/1/settings');
		});
	});

	it('should make link to application settings', () => {
		const wrapper = render(
			<Router>
				<SettingsList
					type="application"
					orgID="1"
					appID="1"
					spaceID="1"
					role="admin"
				/>
			</Router>
		);
		const links = wrapper.find('a');
		Array.from(links).forEach((link) => {
			expect(link.attribs.href).toContain('/applications/1/settings');
		});
	});

	it('should make link to space settings', () => {
		const wrapper = render(
			<Router>
				<SettingsList
					type="space"
					orgID="1"
					appID="1"
					spaceID="1"
					role="admin"
				/>
			</Router>
		);
		const links = wrapper.find('a');
		Array.from(links).forEach((link) => {
			expect(link.attribs.href).toContain('/applications/1/settings/spaces/1/settings');
		});
	});

	it('should render links for owner', () => {
		const wrapper = render(
			<Router>
				<SettingsList
					type="space"
					orgID="1"
					appID="1"
					spaceID="1"
					role="owner"
				/>
			</Router>
		);
		const links = Array.from(wrapper.find('a'))
		expect(links[links.length - 1].attribs.href).toEqual('/applications/1/settings/spaces/1/settings/tokens');
	});

	it('should make not baseLink for other types', () => {
		const wrapper = render(
			<Router>
				<SettingsList
					type="other"
					orgID="1"
					appID="1"
					spaceID="1"
					role="admin"
				/>
			</Router>
		);
		const links = wrapper.find('a');
		const defaults = ['/users', '/roles', '/policies'];
		let i = 0;
		Array.from(links).forEach((link) => {
			expect(link.attribs.href).toContain(defaults[i]);
			i += 1;
		});
	});
});

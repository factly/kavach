import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import UppyUploader from './index';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const state = {
	organisations: {
		selected: 1,
		details: {
			1: {
				slug: 'it-slug',
			},
		},
	},
};

jest.mock('@uppy/core', () => {
	return jest.fn().mockImplementation(() => {
		return {
			use: jest.fn(),
			on: jest.fn(),
			off: jest.fn(),
			upload: jest.fn(),
			getFile: jest.fn(),
			getFi
		};
	});
});

describe('UppyUploader', () => {

	const store = mockStore(state);
	it('renders the component without crashing', () => {
		const component = render(
			<Provider store={store}>
				<UppyUploader />
			</Provider >
		);

		expect(component).toBeTruthy();
		expect(component).toMatchSnapshot();
	});

	xit('uploads a file when the upload button is clicked', async () => {
		const onUpload = jest.fn();
		const { getByLabelText, getByText } = render(<UppyUploader onUpload={onUpload} />);

		const fileInput = getByLabelText('Choose files');
		const file = new File([''], 'xit-image.jpg', { type: 'image/jpeg' });

		fireEvent.change(fileInput, { target: { files: [file] } });
		await waitFor(() => getByText('Upload'));

		fireEvent.click(getByText('Upload'));
		await waitFor(() => expect(onUpload).toHaveBeenCalled());
	});
});

import React from 'react';
import { useDispatch } from 'react-redux';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow, mount } from 'enzyme';
import ClipBoardCopy from '../clipboardClick';
import { act } from 'react-dom/test-utils';
import { addErrorNotification } from '../../actions/notifications';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

const store = mockStore({});

describe('ClipBoardCopy', () => {
  it('should render the component', () => {
    let component = shallow(
      <Provider store={store}>
        <ClipBoardCopy text="my_token" />
      </Provider>,
    );
    expect(component).toMatchSnapshot();
  });
  it('should have a button with text "Copy"', () => {
    render(<ClipBoardCopy text="my_token" />);
    const button = screen.getByText('Copy');
    expect(button).toBeInTheDocument();
  });
  it('copies the token to the clipboard when "Copy" button is clicked', async () => {
    const writeTextMock = jest.fn();
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
    });

    jest.useFakeTimers();

    render(
      <Provider store={store}>
        <ClipBoardCopy text="my_token" />
      </Provider>,
    );
    act(() => {
      fireEvent.click(screen.getByText('Copy'));
    });

    // Simulate the passage of time until 5 seconds have passed
    jest.advanceTimersByTime(5000);

    expect(writeTextMock).toHaveBeenCalledWith('my_token');
  });

  it('displays an error message if the token could not be copied', async () => {
    const execCommandMock = jest.fn(() => false);
    Object.defineProperty(document, 'execCommand', {
      value: execCommandMock,
    });

    render(
      <Provider store={store}>
        <ClipBoardCopy text="my_token" />
      </Provider>,
    );
    act(() => {
      fireEvent.click(screen.getByText('Copy'));
    });
  });
});

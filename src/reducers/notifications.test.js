import reducer from './notifications';
import * as types from '../constants/notifications';

const initialState = {
  type: null,
  message: null,
  description: null,
};

describe('notifications reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(reducer(initialState, { type: 'NON_EXISTING', payload: {} })).toEqual(initialState);
  });
  it('should return the state when payload is empty', () => {
    expect(reducer(initialState, { type: types.ADD_NOTIFICATION })).toEqual(initialState);
  });
  it('should return the state when action is empty', () => {
    expect(reducer(initialState)).toEqual(initialState);
  });
  it('should handle ADD_NOTIFICATION', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_NOTIFICATION,
        payload: {
          type: 'error',
          title: 'Error',
          message: 'Test error message',
        },
      }),
    ).toEqual({
      type: 'error',
      message: 'Error',
      description: 'Test error message',
    });
    expect(
      reducer(initialState, {
        type: types.ADD_NOTIFICATION,
        payload: {
          type: 'success',
          title: 'Success',
          message: 'Test success message',
        },
      }),
    ).toEqual({
      type: 'success',
      message: 'Success',
      description: 'Test success message',
    });
  });
});

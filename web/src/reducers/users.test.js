import reducer from './users';
import * as types from '../constants/users';

const initialState = {
  ids: [],
  details: {},
  loading: true,
};

describe('users reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        ids: [1],
        details: { 1: { id: 1, name: 'user' } },
        loading: false,
      }),
    ).toEqual({
      ids: [1],
      details: { 1: { id: 1, name: 'user' } },
      loading: false,
    });
  });
  it('should handle RESET_USERS', () => {
    expect(
      reducer(
        {
          ids: [1],
          details: [{ id: 1, name: 'user' }],
          loading: false,
        },
        {
          type: types.RESET_USERS,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_USERS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_USERS_LOADING,
        payload: true,
      }),
    ).toEqual({
      ids: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_USERS_LOADING,
        payload: false,
      }),
    ).toEqual({
      ids: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_USERS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_USERS,
        payload: [
          { id: 1, name: 'user 1' },
          { id: 2, name: 'user 2' },
        ],
      }),
    ).toEqual({
      ids: [1, 2],
      details: { 1: { id: 1, name: 'user 1' }, 2: { id: 2, name: 'user 2' } },
      loading: true,
    });
  });
  it('should handle ADD_USERS when already exists', () => {
    expect(
      reducer(
        {
          ids: [1, 2],
          details: {
            1: { id: 1, name: 'existing user 1' },
            2: { id: 2, name: 'existing user 2' },
          },
          loading: false,
        },
        {
          type: types.ADD_USERS,
          payload: [
            { id: 1, name: 'new user 1' },
            { id: 2, name: 'new user 2' },
          ],
        },
      ),
    ).toEqual({
      ids: [1, 2],
      details: {
        1: { id: 1, name: 'new user 1' },
        2: { id: 2, name: 'new user 2' },
      },
      loading: false,
    });
  });
});

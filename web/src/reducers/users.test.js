import reducer from './users';
import * as types from '../constants/users';
import { ADD_ORGANISATION_USERS } from '../constants/organisations';

const initialState = {
  details: {},
  loading: true,
};

describe('users reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(reducer(initialState, { type: 'default' })).toEqual(initialState);
  });
  it('should handle RESET_USERS', () => {
    expect(
      reducer(
        {
          details: [{ id: 1, name: 'user' }],
          loading: false,
        },
        {
          type: types.RESET_USERS,
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle case when no state and action is passed is passed', () => {
    expect(reducer()).toEqual(initialState);
  });
  it('should handle SET_USERS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_USERS_LOADING,
        payload: true,
      }),
    ).toEqual({
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_USERS_LOADING,
        payload: false,
      }),
    ).toEqual({
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_USERS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_USERS,
        payload: {
          1: { id: 1, name: 'user 1' },
          2: { id: 2, name: 'user 2' },
        },
      }),
    ).toEqual(
      {
        details: {
          1: { id: 1, name: 'user 1' },
          2: { id: 2, name: 'user 2' }
        },
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
          payload: {
            1: { id: 1, name: 'new user 1' },
            2: { id: 2, name: 'new user 2' },
          },
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
  xit('should handle ADD_ORGANISATION_USERS ', () => {
    expect(
      reducer(initialState, {
        type: ADD_ORGANISATION_USERS,
        payload: { org_id: 1, users: [{ id: 1, name: 'User' }] },
      }),
    ).toEqual({
      ids: [],
      details: { 1: { id: 1, name: 'User' } },
      organisations: {
        1: [1],
      },
      loading: true,
    });
  });
});

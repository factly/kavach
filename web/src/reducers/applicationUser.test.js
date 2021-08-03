import reducer from './applicationUser';
import * as types from '../constants/applicationUser';

const initialState = {
  details: {},
  loading: true,
};

describe('application reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        details: { 1: { application_id: '1', user_id: '1' } },
        loading: false,
      }),
    ).toEqual({
      details: { 1: { application_id: '1', user_id: '1' } },
      loading: false,
    });
  });
  it('should handle RESET_APPLICATION_USERS', () => {
    expect(
      reducer(
        {
          details: [{ application_id: '1', user_id: '1' }],
          loading: false,
        },
        {
          type: types.RESET_APPLICATION_USERS,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_APPLICATION_USERS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_APPLICATION_USERS_LOADING,
        payload: true,
      }),
    ).toEqual({
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_APPLICATION_USERS_LOADING,
        payload: false,
      }),
    ).toEqual({
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_APPLICATION_USERS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_APPLICATION_USERS,
        payload: {
          users: [
            { application_id: '1', user_id: '1' },
            { application_id: '2', user_id: '2' },
          ],
          id: 1,
        },
      }),
    ).toEqual({
      details: {
        1: [
          { application_id: '1', user_id: '1' },
          { application_id: '2', user_id: '2' },
        ],
      },
      loading: true,
    });
  });
  it('should handle empty payload ADD_APPLICATION_USERS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_APPLICATION_USERS,
        payload: { users: [] },
      }),
    ).toEqual({
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_APPLICATION_USER', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_APPLICATION_USER,
        payload: { id: 1, application_id: '1', user_id: '1' },
      }),
    ).toEqual({
      details: { 1: { id: 1, application_id: '1', user_id: '1' } },
      loading: true,
    });
  });
  it('should handle ADD_APPLICATION_USER when details is non-empty', () => {
    expect(
      reducer(
        {
          details: { 1: { id: 1, application_id: '1', user_id: '1' } },
          loading: false,
        },
        {
          type: types.ADD_APPLICATION_USER,
          payload: { id: 2, application_id: '2', user_id: '2' },
        },
      ),
    ).toEqual({
      details: {
        1: { id: 1, application_id: '1', user_id: '1' },
        2: { id: 2, application_id: '2', user_id: '2' },
      },
      loading: false,
    });
  });
  it('should handle ADD_APPLICATION_USER when already exists', () => {
    expect(
      reducer(
        {
          details: {
            1: { id: 1, application_id: '1', user_id: '1' },
            2: { id: 2, application_id: '2', user_id: '2' },
          },
          loading: false,
        },
        {
          type: types.ADD_APPLICATION_USER,
          payload: { id: 2, application_id: '2', user_id: '3' },
        },
      ),
    ).toEqual({
      details: {
        1: { id: 1, application_id: '1', user_id: '1' },
        2: { id: 2, application_id: '2', user_id: '3' },
      },
      loading: false,
    });
  });
});

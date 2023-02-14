import reducer from './profile';
import * as types from '../constants/profile';
import { ADD_MY_ORGANISATION_ROLE } from '../constants/organisations';
const initialState = {
  details: {},
  roles: {},
  invitations: [],
  loading: true,
};

describe('profile reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        ...initialState,
        details: { 1: { id: 1, email: 'abc@gmail.com', first_name: 'abc' } },
        loading: false,
      }),
    ).toEqual({
      ...initialState,
      details: { 1: { id: 1, email: 'abc@gmail.com', first_name: 'abc' } },
      loading: false,
    });
  });
  it('should handle SET_PROFILE_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_PROFILE_LOADING,
        payload: true,
      }),
    ).toEqual({
      ...initialState,
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_PROFILE_LOADING,
        payload: false,
      }),
    ).toEqual({
      ...initialState,
      loading: false,
    });
  });
  it('should handle ADD_PROFILE', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_PROFILE,
        payload: { id: 1, email: 'abc@gmail.com', first_name: 'abc' },
      }),
    ).toEqual({
      ...initialState,
      details: { id: 1, email: 'abc@gmail.com', first_name: 'abc' },
      loading: true,
    });
  });
  it('should handle ADD_INVITE', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_INVITE,
        payload: [{ id: 1, email: 'qwerty@gmail.com', first_name: 'qwerty' }],
      }),
    ).toEqual({
      ...initialState,
      invitations: [{ id: 1, email: 'qwerty@gmail.com', first_name: 'qwerty' }],
    });
  });
  it('should handle DELETE_INVITE', () => {
    expect(
      reducer(
        {
          ...initialState,
          invitations: [{ id: 1, email: 'qwerty@gmail.com', first_name: 'qwerty' }, { id: 2, email: 'asdfg@gmail.com', first_name: 'asdfg'}],
        },
        {
          type: types.DELETE_INVITE,
          payload: 1,
        },
      ),
    ).toEqual({
      ...initialState,
      invitations: [{ id: 2, email: 'asdfg@gmail.com', first_name: 'asdfg' }],
    });

  });
  it('should handle ADD_PROFILE_DETAILS', () => {
    // the reducer is not doing anything for this action just returning the state
    expect(
      reducer(initialState, {
        type: types.ADD_PROFILE_DETAILS,
      }),
    ).toEqual(initialState);
  });
  it('should handle ADD_ORGANISATION_IDS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_ORGANISATION_IDS,
        payload: [1, 2, 3],
      }),
    ).toEqual({
      ...initialState,
      details: {
        ...initialState.details,
        organisations: [1, 2, 3],
      },
    });
  });
  it('should handle ADD_MY_ORGANISATION_ROLE', () => {
    expect(
      reducer(initialState, {
        type: ADD_MY_ORGANISATION_ROLE,
        payload: { 1: { id: 1, role: 'admin' } },
      }),
    ).toEqual({
      ...initialState,
      roles: { 1: { id: 1, role: 'admin' } },
    });
  });
});

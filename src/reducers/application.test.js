import reducer from './application';
import * as types from '../constants/application';

const initialState = {
  req: [],
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
        req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
        details: { 1: { id: 1, name: 'Application 1' } },
        loading: false,
      }),
    ).toEqual({
      req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
      details: { 1: { id: 1, name: 'Application 1' } },
      loading: false,
    });
  });
  it('should handle RESET_APPLICATIONS', () => {
    expect(
      reducer(
        {
          details: [{ id: 1, name: 'Application 1' }],
          loading: false,
        },
        {
          type: types.RESET_APPLICATIONS,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_APPLICATIONS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_APPLICATIONS_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_APPLICATIONS_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_APPLICATIONS_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_APPLICATIONS_REQUEST,
        payload: {
          data: [1, 2, 3],
          query: { page: 1, limit: 5 },
          total: 3,
        },
      }),
    ).toEqual({
      req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_APPLICATIONS_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_APPLICATIONS_REQUEST,
          payload: {
            data: [1, 2, 3],
            query: { page: 1, limit: 5 },
            total: 3,
          },
        },
      ),
    ).toEqual({
      req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_APPLICATIONS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_APPLICATIONS,
        payload: [
          { id: 1, name: 'Application 1' },
          { id: 2, name: 'Application 2' },
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'Application 1' }, 2: { id: 2, name: 'Application 2' } },
      loading: true,
    });
  });
  it('should handle empty payload ADD_APPLICATIONS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_APPLICATIONS,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_APPLICATION', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_APPLICATION,
        payload: { id: 1, name: 'new application' },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, name: 'new application' } },
      loading: true,
    });
  });
  it('should handle ADD_APPLICATION when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, name: 'existing application' } },
          loading: false,
        },
        {
          type: types.ADD_APPLICATION,
          payload: { id: 2, name: 'new application' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing application' },
        2: { id: 2, name: 'new application' },
      },
      loading: false,
    });
  });
  it('should handle ADD_APPLICATION when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, name: 'existing application' },
            2: { id: 2, name: 'new application' },
          },
          loading: false,
        },
        {
          type: types.ADD_APPLICATION,
          payload: { id: 2, name: 'updated application' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, name: 'existing application' },
        2: { id: 2, name: 'updated application' },
      },
      loading: false,
    });
  });
});

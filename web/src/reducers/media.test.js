import reducer from './media';
import * as types from '../constants/media';

const initialState = {
  req: [],
  details: {},
  loading: true,
};

describe('media reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
        details: { 1: { id: 1, medium: 'Medium 1' } },
        loading: false,
      }),
    ).toEqual({
      req: [{ data: [1, 2, 3], query: { page: 1, limit: 5 }, total: 3 }],
      details: { 1: { id: 1, medium: 'Medium 1' } },
      loading: false,
    });
  });
  it('should handle RESET_MEDIA', () => {
    expect(
      reducer(
        {
          details: [{ id: 1, medium: 'Medium 1' }],
          loading: false,
        },
        {
          type: types.RESET_MEDIA,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_MEDIA_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_MEDIA_LOADING,
        payload: true,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
    expect(
      reducer(initialState, {
        type: types.SET_MEDIA_LOADING,
        payload: false,
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: false,
    });
  });
  it('should handle ADD_MEDIA_REQUEST', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_MEDIA_REQUEST,
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
  it('should handle ADD_MEDIA_REQUEST when req already exists', () => {
    expect(
      reducer(
        {
          req: [{ data: [1, 2], query: { page: 1, limit: 5 }, total: 2 }],
          details: {},
          loading: true,
        },
        {
          type: types.ADD_MEDIA_REQUEST,
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
  it('should handle ADD_MEDIA', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_MEDIA,
        payload: [
          { id: 1, medium: 'Medium 1' },
          { id: 2, medium: 'Medium 2' },
        ],
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, medium: 'Medium 1' }, 2: { id: 2, medium: 'Medium 2' } },
      loading: true,
    });
  });
  it('should handle empty payload ADD_MEDIA', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_MEDIA,
        payload: [],
      }),
    ).toEqual({
      req: [],
      details: {},
      loading: true,
    });
  });
  it('should handle ADD_MEDIUM', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_MEDIUM,
        payload: { id: 1, medium: 'new medium' },
      }),
    ).toEqual({
      req: [],
      details: { 1: { id: 1, medium: 'new medium' } },
      loading: true,
    });
  });
  it('should handle ADD_MEDIUM when details is non-empty', () => {
    expect(
      reducer(
        {
          req: [],
          details: { 1: { id: 1, medium: 'existing medium' } },
          loading: false,
        },
        {
          type: types.ADD_MEDIUM,
          payload: { id: 2, medium: 'new medium' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, medium: 'existing medium' },
        2: { id: 2, medium: 'new medium' },
      },
      loading: false,
    });
  });
  it('should handle ADD_MEDIUM when already exists', () => {
    expect(
      reducer(
        {
          req: [],
          details: {
            1: { id: 1, medium: 'existing medium' },
            2: { id: 2, medium: 'new medium' },
          },
          loading: false,
        },
        {
          type: types.ADD_MEDIUM,
          payload: { id: 2, medium: 'updated medium' },
        },
      ),
    ).toEqual({
      req: [],
      details: {
        1: { id: 1, medium: 'existing medium' },
        2: { id: 2, medium: 'updated medium' },
      },
      loading: false,
    });
  });
});
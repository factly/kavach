import { fetchDataStart, fetchDataSuccess, fetchDataFailure } from './slice';

export const fetchData = () => async (dispatch) => {
    dispatch(fetchDataStart());
    try {
      const response = await fetch('http://127.0.0.1:4455/.factly/kavach/server/organisations/my');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      
      dispatch(fetchDataSuccess(data));
    } catch (error) {
      dispatch(fetchDataFailure(error.message));
    }
  };
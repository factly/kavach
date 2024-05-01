const initialState = {
    organizations: [], 
    loading: false,
    error: null,
  };
  
  const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
      fetchDataStart(state) {
        state.loading = true;
        state.error = null;
      },
      fetchDataSuccess(state, action) {
        state.loading = false;
        state.organizations = action.payload; 
        state.error = null; 
      },
      fetchDataFailure(state, action) {
        state.loading = false;
        state.error = action.payload;
      },
      deleteOrganization(state, action) {
        const idToDelete = action.payload;
        state.organizations = state.organizations.filter(org => org.id !== idToDelete);
      },
    },
  });
  
  export const { fetchDataStart, fetchDataSuccess, fetchDataFailure, deleteOrganization } = dataSlice.actions;
  
  export default dataSlice.reducer;
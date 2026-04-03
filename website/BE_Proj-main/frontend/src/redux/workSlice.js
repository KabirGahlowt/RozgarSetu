import { createSlice } from "@reduxjs/toolkit";

const workSlice = createSlice ({
    name : "work",
    initialState : {
        allWorkers:[],
        singleWorker:null,
        searchWorkerByText:"",
        searchQuery:"",
        /** City / skill / availability filters on Browse Workers (AND logic) */
        browseFilters: { city: "", skill: "", availability: "" },
    },
    reducers : {
        //actions
        setAllWorkers : (state,action) => {
            state.allWorkers = action.payload;
        },
        setSingleWorker:(state,action) => {
            state.singleWorker = action.payload;
        },
        setSearchWorkerByText:(state,action) => {
            state.searchWorkerByText = action.payload;
        },
        setSearchQuery:(state,action) => {
            state.searchQuery = action.payload;
        },
        setBrowseFilters: (state, action) => {
            const base = state.browseFilters ?? { city: "", skill: "", availability: "" };
            state.browseFilters = { ...base, ...action.payload };
        },
        clearBrowseFilters: (state) => {
            state.browseFilters = { city: "", skill: "", availability: "" };
        },
    }
});

export const {setAllWorkers, setSingleWorker, setSearchWorkerByText, setSearchQuery, setBrowseFilters, clearBrowseFilters} = workSlice.actions;
export default workSlice.reducer;
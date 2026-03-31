import { createSlice } from "@reduxjs/toolkit";

const workSlice = createSlice ({
    name : "work",
    initialState : {
        allWorkers:[],
        singleWorker:null,
        searchWorkerByText:"",
        searchQuery:"",
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
    }
});

export const {setAllWorkers, setSingleWorker, setSearchWorkerByText, setSearchQuery} = workSlice.actions;
export default workSlice.reducer;
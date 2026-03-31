import { createSlice } from "@reduxjs/toolkit";

const workSlice = createSlice ({
    name : "work",
    initialState : {
        allWorkers:[],
        singleWorker:null,
    },
    reducers : {
        //actions
        setAllWorkers : (state,action) => {
            state.allWorkers = action.payload;
        },
        setSingleWorker:(state,action) => {
            state.singleWorker = action.payload;
        }
    }
});

export const {setAllWorkers, setSingleWorker} = workSlice.actions;
export default workSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

const applicationSlice = createSlice({
    name: 'application',
    initialState: {
        applicants:[],
        clientHires:[],
    },
    reducers:{
        setAllApplicants:(state,action) => {
            state.applicants = action.payload;
        },
        setClientHires:(state,action) => {
            state.clientHires = action.payload;
        }
    }
});

export const {setAllApplicants, setClientHires} = applicationSlice.actions;
export default applicationSlice.reducer;
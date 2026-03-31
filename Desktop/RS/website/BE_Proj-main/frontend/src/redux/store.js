import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import workSlice from "./workSlice";

const store = configureStore({
    reducer:{
        auth: authSlice,
        work: workSlice,
    }

});

export default store;
import { createSlice } from "@reduxjs/toolkit";

const reviewSlice = createSlice({
    name: "review",
    initialState: {
        reviews: [],
        avgRating: 0,
        loading: false,
    },
    reducers: {
        setReviews: (state, action) => {
            state.reviews = action.payload;
        },
        setAvgRating: (state, action) => {
            state.avgRating = action.payload;
        },
        setReviewLoading: (state, action) => {
            state.loading = action.payload;
        },
        addReview:(state, action) => {
            state.reviews.unshift(action.payload); //this is to add new reviews to the top
        },
    }
});

export const {setReviews, setAvgRating, setReviewLoading, addReview} = reviewSlice.actions;

export default reviewSlice.reducer;
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  setAvgRating,
  setReviewLoading,
  setReviews,
} from "../redux/reviewSlice";
import axios from "axios";
import { REVIEW_API_END_POINT } from "../utils/constant";

const useGetWorkerReviews = (workerId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!workerId) return;

    const fetchReviews = async () => {
      try {
        dispatch(setReviewLoading(true));

        const res = await axios.get(
          `${REVIEW_API_END_POINT}/review/${workerId}`,
        );

        if (res.data.success) {
          dispatch(setReviews(res.data.reviews));
          dispatch(setAvgRating(res.data.avgRating));
        }
      } catch (error) {
        console.log(error);
      } finally {
        dispatch(setReviewLoading(false));
      }
    };
    fetchReviews();
  }, [workerId]);
};

export default useGetWorkerReviews;

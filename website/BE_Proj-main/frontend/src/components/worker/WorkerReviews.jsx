import React from "react";
import { useSelector } from "react-redux";
import { Star } from "lucide-react";

const WorkerReviews = () => {
  const { reviews } = useSelector((store) => store.review);

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2
        style={{
          margin: "0 0 1rem",
          fontFamily: "var(--rs-font)",
          fontSize: "1.05rem",
          fontWeight: 600,
          color: "#fff",
        }}
      >
        Reviews <span style={{ color: "var(--rs-saffron)" }}>({reviews.length})</span>
      </h2>

      {reviews.length === 0 ? (
        <div className="rs-glass" style={{ padding: "1.5rem", borderRadius: "0.75rem", textAlign: "center" }}>
          <p style={{ margin: 0, color: "var(--rs-text-muted)", fontSize: "0.88rem", fontFamily: "var(--rs-font)" }}>
            No reviews yet.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {reviews.map((review) => (
            <div
              key={review._id}
              className="rs-glass-strong"
              style={{
                padding: "1.1rem 1.25rem",
                borderRadius: "0.85rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.65rem" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid rgba(255,153,51,0.35)",
                    background: "rgba(255,153,51,0.1)",
                    flexShrink: 0,
                  }}
                >
                  {review?.client?.profilePhoto ? (
                    <img src={review.client.profilePhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FF9933",
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                    >
                      {review?.client?.fullname?.[0] || "?"}
                    </div>
                  )}
                </div>
                <span style={{ fontWeight: 600, color: "#fff", fontFamily: "var(--rs-font)", fontSize: "0.92rem" }}>
                  {review?.client?.fullname || "Client"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "3px", marginBottom: "0.5rem" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={15}
                    style={{
                      color: star <= (review.rating || 0) ? "#FF9933" : "rgba(255,255,255,0.2)",
                      fill: star <= (review.rating || 0) ? "#FF9933" : "transparent",
                    }}
                  />
                ))}
              </div>
              <p style={{ margin: 0, color: "var(--rs-text-secondary)", fontSize: "0.88rem", lineHeight: 1.55, fontFamily: "var(--rs-font)" }}>
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerReviews;

import React from "react";
import Navbar from "./shared/Navbar";
import HeroSection from "./HeroSection";
import CategoryCarousel from "./CategoryCarousel";
import LatestJobs from "./LatestJobs";
import Footer from "./shared/Footer";
import useGetAllWorkers from "../hooks/useGetAllWorkers";

const Home = () => {
  useGetAllWorkers();
  return (
    <div style={{ background: "var(--rs-navy)", minHeight: "100vh" }}>
      {/* Fixed navbar overlays everything — must be mounted to render */}
      <Navbar />
      <HeroSection />

      {/* Below-the-fold sections get the dark gradient bg */}
      <div style={{
        background:
          "radial-gradient(ellipse at 80% 0%, rgba(255,153,51,0.06) 0%, transparent 50%)," +
          "radial-gradient(ellipse at 0% 80%, rgba(19,136,8,0.05) 0%, transparent 50%)," +
          "linear-gradient(180deg,#04061a 0%,#020510 60%,#010208 100%)",
      }}>
        <CategoryCarousel />
        <LatestJobs />
        <Footer />
      </div>
    </div>
  );
};

export default Home;

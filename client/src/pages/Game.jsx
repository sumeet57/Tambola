import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import AssignNumbers from "../components/AssignNumbers";
import DrawNumbers from "../components/DrawNumbers";
import { useLocation } from "react-router-dom";

const Game = () => {
  const location = useLocation();
  const assign_no = location.state?.numbers;
  return (
    <>
      <Header />
      <div className="cont flex flex-col justify-center items-center pt-20">
        <div className="flex flex-col justify-center items-center max-w-xl">
          <DrawNumbers />
          <AssignNumbers data={assign_no} />
        </div>
      </div>
    </>
  );
};

export default Game;

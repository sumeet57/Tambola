import React, { useState, useEffect } from "react";
import AssignNumbers from "../components/AssignNumbers";
import DrawNumbers from "../components/DrawNumbers";
import { useLocation, Outlet } from "react-router-dom";

const Game = () => {
  const location = useLocation();
  const assign_no = location.state?.numbers;

  return (
    <>
      {location.pathname === "/game" ? (
        <div className="cont flex flex-col justify-center items-center pt-20">
          <div className="flex flex-col justify-center items-center max-w-[23rem]">
            <DrawNumbers />
            <AssignNumbers data={assign_no} />
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default Game;

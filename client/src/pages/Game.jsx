import React, { useState, useEffect } from "react";
import AssignNumbers from "../components/assignNumbers";
import DrawNumbers from "../components/DrawNumbers";
import { useLocation } from "react-router-dom";

const Game = () => {
  const location = useLocation();
  const assign_no = location.state?.numbers;
  return (
    <>
      <h1>from game route</h1>
      <AssignNumbers data={assign_no} />
      <h1>draw numbers = </h1>
      <DrawNumbers />
    </>
  );
};

export default Game;

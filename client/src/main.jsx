import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {
  BrowserRouter,
  RouterProvider,
  Router,
  Route,
  createBrowserRouter,
} from "react-router-dom";

//import components
import Login from "./components/Login.jsx";
import Register from "./components/register.jsx";
import Hostroom from "./pages/Hostroom.jsx";
import Userroom from "./pages/Userroom.jsx";
import Userpage from "./pages/Userpage.jsx";
import Hostpage from "./pages/Hostpage.jsx";
import Game from "./pages/Game.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/user",
    element: <Userpage />,
    children: [
      {
        path: "room/:roomid",
        element: <Userroom />,
      },
      //this /user/:roomid is when user is invited to join a room by host to extract roomid from url
      {
        path: ":roomid",
        element: <Userroom />,
      },
    ],
  },
  {
    path: "/host",
    element: <Hostpage />,
    children: [
      {
        path: "room/:roomid",
        element: <Hostroom />,
      },
    ],
  },
  {
    path: "/game",
    element: <Game />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>
);

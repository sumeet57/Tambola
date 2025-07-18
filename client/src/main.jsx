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
import Authentication from "./components/Authentication.jsx";

//imported host, user, and game pages
import Hostroom from "./pages/Hostroom.jsx";
import Userroom from "./pages/Userroom.jsx";
import Userpage from "./pages/Userpage.jsx";
import Hostpage from "./pages/Hostpage.jsx";
import ReconnectPage from "./pages/ReconnectPage.jsx";
import Game from "./pages/Game.jsx";
import GameOver from "./pages/GameOver.jsx";

//imported extra pages
import Dashboard from "./pages/Dashboard.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";

//imported context
import { PlayerProvider } from "./context/PlayerContext.jsx";
import { GameContextProvider } from "./context/GameContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import UnAuthorizePage from "./pages/UnAuthorizePage.jsx";

//tostify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Bounce } from "react-toastify";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/auth",
    element: <Authentication />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["host"]}>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        path: ":id",
        element: (
          <ProtectedRoute allowedRoles={["host"]}>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/reconnect/:roomid",
    element: <ReconnectPage />,
  },
  {
    path: "unauthorized",
    element: <UnAuthorizePage />,
  },
  {
    path: "/user",
    element: (
      // <ProtectedRoute allowedRoles={["user"]}>
      <Userpage />
      // </ProtectedRoute>
    ),
    children: [
      {
        path: "room/:roomid",
        element: (
          <ProtectedRoute allowedRoles={["user"]}>
            <Userroom />
          </ProtectedRoute>
        ),
      },
      //this /user/:roomid is when user is invited to join a room by host to extract roomid from url
      {
        path: ":publicId",
        element: (
          // <ProtectedRoute allowedRoles={["user"]}>
          <Userpage />
          // </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/host",
    element: (
      <ProtectedRoute allowedRoles={["host"]}>
        <Hostpage />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "room/:roomid",
        element: (
          <ProtectedRoute allowedRoles={["host"]}>
            <Hostroom />
          </ProtectedRoute>
        ),
      },
      {
        path: ":roomid",
        element: (
          <ProtectedRoute allowedRoles={["host"]}>
            <Hostpage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/game",
    element: <Game />,
    children: [
      {
        path: "gameover",
        element: <GameOver />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PlayerProvider>
      <GameContextProvider>
        <RouterProvider router={router}></RouterProvider>
      </GameContextProvider>
    </PlayerProvider>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      limit={5}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      transition={Bounce}
      className="app-toast-container"
    />
  </StrictMode>
);

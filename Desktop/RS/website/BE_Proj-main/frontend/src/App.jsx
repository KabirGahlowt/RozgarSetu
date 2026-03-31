import "./App.css";
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from "react-router-dom";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Singup";
import Home from "./components/Home";
import Workers from "./components/Workers";
import Browse from "./components/Browse";
import Profile from "./components/Profile";
import WorkerDescription from "./components/WorkerDescription";
import ChatBot from "./components/ChatBot";
import AssistantPage from "./components/AssistantPage";

function AppLayout() {
  const location = useLocation();
  const onAssistant = location.pathname === "/assistant";

  return (
    <>
      <Outlet />
      {!onAssistant && <ChatBot />}
    </>
  );
}

const appRouter = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/workers",
        element: <Workers />,
      },
      {
        path: "/description/:id",
        element: <WorkerDescription />,
      },
      {
        path: "/browse",
        element: <Browse />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/assistant",
        element: <AssistantPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={appRouter} />;
}

export default App;

import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import React from "react";
import { PublicRoute } from "./ProtextedRoute";

// 使用懒加载
const Home = React.lazy(() => import("@/pages/Home"));
const About = React.lazy(() => import("@/pages/About"));
const Article = React.lazy(() => import("@/pages/Article"));
const CategoryPage = React.lazy(() => import("@/pages/Category"));
const TagPage = React.lazy(() => import("@/pages/Tag"));
const Login = React.lazy(() => import("@/pages/Login"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "article/:id",
        element: <Article />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "category/:alias",
        element: <CategoryPage />,
      },
      {
        path: "tag/:alias",
        element: <TagPage />,
      },
    ],
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;

import { useNavigate } from "react-router-dom";
import ThemeSwitcher from "./components/ThemeSwitcher";
import SearchBtn from "./components/SearchBtn";
import { useAuth } from "@/store/useAuth";
import { Avatar, Dropdown, message, Modal } from "antd";
import type { MenuProps } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useShallow } from "zustand/react/shallow";

export default function TopBar() {
  const navigate = useNavigate();
  const { isLogin, userInfo, logout } = useAuth(
    useShallow((s) => ({
      isLogin: s.isLogin,
      userInfo: s.userInfo,
      logout: s.logout,
    }))
  );

  const navList = [
    { name: "首页", path: "/" },
    { name: "关于", path: "/about" },
  ];

  const gotoRelatedPage = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    Modal.confirm({
      title: "确认退出",
      content: "确定要退出登录吗？",
      okText: "确定",
      cancelText: "取消",
      onOk: () => {
        logout();
        message.success("已退出登录");
        navigate("/login");
      },
    });
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: handleLogout,
    },
  ];

  return (
    <div className="top-bar bg-bg border-bottom flex-between h-60px px-4 w-full fixed top-0 z-10">
      <div className="flex items-center">
        <span className="font-bold">与君同的博客</span>
      </div>
      <div className="nav-wrapper">
        <ul className="flex">
          {navList.map((item) => (
            <li
              className={`nav-item text-hovers mx-4 ${
                location.pathname === item.path ? "text-primary" : ""
              }`}
              key={item.name}
            >
              <span onClick={() => gotoRelatedPage(item.path)}>
                {item.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="control-btn text-xl flex gap-2 items-center">
        <SearchBtn />
        <ThemeSwitcher />
        {isLogin ? (
          <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <span className="cursor-pointer ml-2">
              <Avatar
                size={32}
                src={userInfo.avatar || undefined}
                icon={<UserOutlined />}
                style={{
                  background: "var(--color-primary)",
                }}
              />
            </span>
          </Dropdown>
        ) : (
          <span
            className="ml-2 cursor-pointer text-sm font-medium px-3 py-1 rounded-full"
            style={{
              color: "var(--color-primary)",
              border: "1px solid var(--color-primary)",
            }}
            onClick={() => navigate("/login")}
          >
            登录
          </span>
        )}
      </div>
    </div>
  );
}

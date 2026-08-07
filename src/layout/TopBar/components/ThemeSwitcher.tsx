import { useTheme } from "@/store/useTheme";
import { AppstoreOutlined, MoonFilled, SunFilled } from "@ant-design/icons";

export default function ThemeSwitcher() {
  const { mode, toggleMode } = useTheme();

  return (
    <div className="flex gap-2 items-center">
      {/* 明暗模式切换 */}
      <span
        className="text-hovers text-hover-rotate mr-4"
        title="切换模式"
        onClick={toggleMode}
      >
        {mode === "light" ? <SunFilled /> : <MoonFilled />}
      </span>
      <span className="text-hovers" title="打开中控台">
        <AppstoreOutlined />
      </span>
    </div>
  );
}

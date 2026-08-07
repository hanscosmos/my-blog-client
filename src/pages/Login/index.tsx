import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi, getValidCodeApi } from "@/api/user";
import { useAuth } from "@/store/useAuth";
import { Button, Form, Input, message } from "antd";
import request from "@/services/request";
import { MD5 } from "crypto-js";

const shapes = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  size: 80 + i * 40,
  left: 10 + i * 15,
  top: 5 + i * 12,
  delay: i * 0.8,
  duration: 6 + i * 2,
}));

export default function Login() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const [loading, setLoading] = useState(false);
  const [validKey, setValidKey] = useState("");
  const [validCode, setValidCode] = useState("");

  const fetchValidCode = async () => {
    const key = crypto.randomUUID();
    setValidKey(key);
    try {
      const res = await getValidCodeApi({ key });
      setValidCode(res);
    } catch {
      message.error("验证码获取失败");
    }
  };

  useEffect(() => {
    fetchValidCode();
  }, []);

  const onFinish = async (values: { username: string; password: string; code: string }) => {
    setLoading(true);
    try {
      const res = await loginApi({
        username: values.username,
        password: MD5(values.password).toString(),
        key: validKey,
        code: values.code,
      });
      login({
        token: res.token,
        csrfToken: res.csrfToken,
        userInfo: res.userInfo,
      });
      request.setCsrfCookie(res.csrfToken);
      message.success("登录成功");
      navigate("/");
    } catch {
      // error already handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4" style={{
      background: "linear-gradient(135deg, var(--color-bg) 0%, var(--color-container-bg) 50%, var(--color-bg) 100%)",
    }}>
      {/* Animated background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {shapes.map((shape) => (
          <div
            key={shape.id}
            className="absolute rounded-full opacity-5"
            style={{
              width: shape.size,
              height: shape.size,
              left: `${shape.left}%`,
              top: `${shape.top}%`,
              background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
              animation: `float ${shape.duration}s ease-in-out ${shape.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-[420px] rounded-2xl shadow-xl p-8" style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        backdropFilter: "blur(10px)",
      }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{
            background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          }}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            用户登录
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
            欢迎来到与君同的博客
          </p>
        </div>

        {/* Form */}
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input
              placeholder="请输入用户名"
              size="large"
              prefix={
                <svg className="w-4 h-4" style={{ color: "var(--color-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              placeholder="请输入密码"
              size="large"
              prefix={
                <svg className="w-4 h-4" style={{ color: "var(--color-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />
          </Form.Item>
          <Form.Item
            label="验证码"
            name="code"
            rules={[{ required: true, message: "请输入验证码" }]}
          >
            <div className="flex gap-2">
              <Input
                placeholder="请输入验证码"
                size="large"
                className="flex-1"
              />
              <div
                className="flex items-center justify-center cursor-pointer select-none rounded-lg font-mono text-lg tracking-widest"
                style={{
                  width: 120,
                  height: 40,
                  background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                  color: "#fff",
                  fontWeight: 700,
                }}
                onClick={fetchValidCode}
              >
                {validCode}
              </div>
            </div>
          </Form.Item>
          <Form.Item className="!mb-0">
            <Button
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{
                background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                border: "none",
                height: "44px",
                fontWeight: 500,
              }}
            >
              登 录
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* Floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-40px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useLogin } from "@/hooks/auth/useLogin";

const Login = () => {
  const { mutate: login, isPending } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      {/* 로그인 카드 */}
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        {/* 로고 */}
        <div className="flex justify-center mb-6">
          <img
            src="/bugs_star_logo.png"
            alt="Bugs Star"
            className="w-24 h-24 object-contain"
          />
        </div>

        {/* 제목 */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          관리자 로그인
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border rounded-3xl border-gray-400 focus:outline-none focus:ring-1 focus:ring-[#005C14] focus:border-[#005C14]"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border rounded-3xl border-gray-400 focus:outline-none focus:ring-1 focus:ring-[#005C14] focus:border-[#005C14]"
          />

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#005C14] mt-6 py-3 rounded-3xl text-white font-semibold hover:bg-[#004010] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isPending ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

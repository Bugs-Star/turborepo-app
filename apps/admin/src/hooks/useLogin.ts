"use client";

import { AuthService, LoginResponse, LoginPayload } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useLogin = () => {
  const router = useRouter();

  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: AuthService.login,
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);

      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("로그인 실패:", error);
      alert("로그인에 실패했습니다. 이메일/비밀번호를 확인해주세요.");
    },
  });
};

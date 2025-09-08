"use client";

import { AuthService, LoginResponse, LoginPayload } from "@/lib/api/auth";
import { notify } from "@/lib/notify";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useLogin = () => {
  const router = useRouter();

  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: AuthService.login,
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      notify.success("로그인에 성공했습니다.");
      router.push("/dashboard");
    },
    onError: (error) => {
      notify.error("로그인에 실패했습니다.");
      console.error("로그인 실패:", error);
    },
  });
};

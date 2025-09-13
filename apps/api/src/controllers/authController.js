/* ------------------------------------------------------------
 * File      : /src/controllers/authController.js
 * Brief     : auth(회원가입, 로그인, 로그아웃, 토큰 갱신) 컨트롤러
 * Author    : 송용훈
 * Date      : 2025-09-13
 * Version   : 
 * History
 * ------------------------------------------------------------*/

import User from "../models/User.js";
import { generateAccessToken } from "../utils/accessTokenUtils.js";
import {
  generateRefreshToken,
  refreshTokens,
  decodeRefreshToken,
} from "../utils/refreshTokenUtils.js";
import { compressMulterFile } from "../utils/imageUtils.js";
import { addToBlacklist } from "../utils/jwtBlacklist.js";

// 회원가입
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    console.log("회원가입 요청:", { email, name }); // 디버깅용

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "이미 존재하는 이메일입니다." });
    }

    // 유저 생성
    const user = new User({
      email,
      passwordHash: password, // 미들웨어에서 자동으로 해싱됨
      name,
    });
    await user.save();

    console.log("유저 생성 성공:", user._id); // 디버깅용

    res.status(201).json({
      message: "회원가입이 완료되었습니다. 로그인해주세요.",
    });
  } catch (error) {
    console.error("회원가입 에러:", error); // 디버깅용
    res.status(500).json({
      message: "서버 오류가 발생했습니다.",
      error: error.message, // 개발 중에만 사용
    });
  }
};

// 로그인
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 유저 찾기
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "이메일 또는 비밀번호가 잘못되었습니다." });
    }

    // 비밀번호 확인
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "이메일 또는 비밀번호가 잘못되었습니다." });
    }

    // Access Token과 Refresh Token 생성
    const accessToken = generateAccessToken({ userId: user._id });
    const refreshToken = generateRefreshToken({ userId: user._id });

    // Refresh Token을 DB에 저장 (세션 관리를 위해 유지)
    user.refreshToken = refreshToken;
    await user.save();

    // Refresh Token을 httpOnly 쿠키에 담아 전송
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 프로덕션 환경에서는 https를 사용해야 함
      sameSite: "lax", // CSRF 공격 방지
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    // Access Token은 body에 담아 전송
    res.json({
      accessToken,
      _id: user._id,
    });
  } catch (error) {
    console.error("로그인 오류:", error);
    res.status(500).json({
      message: "서버 오류가 발생했습니다.",
      error: error.message, // 개발 중에만 사용
    });
  }
};

// 토큰 갱신
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies; // body가 아닌 cookies에서 토큰을 가져옵니다.

    const result = await refreshTokens(refreshToken);
    res.json(result);
  } catch (error) {
    console.error("토큰 갱신 오류:", error);

    if (error.message === "Refresh Token이 필요합니다.") {
      return res.status(400).json({ message: error.message });
    }

    res.status(401).json({ message: "토큰 갱신에 실패했습니다." });
  }
};

// 내 정보 조회
export const getProfile = async (req, res) => {
  try {
    res.json({
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        profileImg: req.user.profileImg,
        // refreshToken 필드 제외
      },
    });
  } catch (error) {
    res
      .status(401)
      .json({ message: "Unauthorized - Invalid or missing token" });
  }
};

// 내 정보 수정 (이름, 비밀번호, 프로필 이미지)
export const updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    console.log("프로필 업데이트 요청:", {
      hasName: !!name,
      hasNewPassword: !!newPassword,
      hasImage: !!req.file,
    });

    const updateData = {};

    // 이름 수정
    if (name) {
      updateData.name = name;
    }

    // 비밀번호 수정
    if (newPassword) {
      // 현재 비밀번호 검증
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "현재 비밀번호를 입력해주세요." });
      }

      // 유저 정보 가져오기
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }

      // 현재 비밀번호 확인
      const isCurrentPasswordValid =
        await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res
          .status(400)
          .json({ message: "현재 비밀번호가 올바르지 않습니다." });
      }

      // 새 비밀번호가 현재 비밀번호와 동일한지 확인
      if (currentPassword === newPassword) {
        return res
          .status(400)
          .json({ message: "새 비밀번호는 현재 비밀번호와 달라야 합니다." });
      }

      updateData.passwordHash = newPassword; // User 모델의 pre-save 미들웨어에서 자동 해싱
    }

    // 프로필 이미지 수정
    if (req.file) {
      try {
        console.log("프로필 이미지 압축 시작...");

        const compressionResult = await compressMulterFile(
          req.file,
          { maxWidth: 300, maxHeight: 300, quality: 85 },
          "profile"
        );

        console.log("프로필 이미지 압축 완료:", {
          원본크기: `${compressionResult.original.sizeKB}KB`,
          압축크기: `${compressionResult.compressed.sizeKB}KB`,
          압축률: `${compressionResult.compressionRatio}%`,
          절약공간: `${Math.round((compressionResult.savedSpace / 1024) * 100) / 100}KB`,
        });

        updateData.profileImg = compressionResult.compressed.base64;
      } catch (compressionError) {
        console.error("프로필 이미지 압축 실패:", compressionError);
        return res.status(400).json({ message: "이미지 압축에 실패했습니다." });
      }
    }

    // 데이터가 없으면 에러
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "업데이트할 데이터가 없습니다." });
    }

    // 유저 정보 업데이트 (비밀번호 변경이 아닌 경우에만 user 객체 재조회)
    let user;
    if (!newPassword) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }
    } else {
      // 비밀번호 변경의 경우 이미 위에서 user 객체를 가져왔으므로 재사용
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }
    }

    // 업데이트할 필드들을 설정
    if (name) user.name = name;
    if (newPassword) user.passwordHash = newPassword; // pre-save 미들웨어가 자동으로 해싱
    if (req.file) user.profileImg = updateData.profileImg;

    // save()를 사용하여 pre-save 미들웨어 실행
    await user.save();

    // 비밀번호 필드를 제외한 사용자 정보 반환
    const updatedUser = await User.findById(userId).select("-passwordHash");

    console.log("프로필 수정 성공:", updatedUser._id);

    res.json({
      message: "프로필이 성공적으로 업데이트되었습니다.",
    });
  } catch (error) {
    console.error("프로필 업데이트 오류:", error);
    res.status(500).json({
      message: "프로필 업데이트 중 오류가 발생했습니다.",
      error: error.message, // 개발 중에만 사용
    });
  }
};

// 로그아웃
export const logout = async (req, res) => {
  try {
    const accessToken = req.header("Authorization")?.replace("Bearer ", "");
    const { refreshToken } = req.cookies; // body가 아닌 cookies에서 토큰을 가져옵니다.

    if (!accessToken) {
      return res.status(400).json({ message: "Access Token이 필요합니다." });
    }

    // Access Token을 블랙리스트에 추가
    await addToBlacklist(accessToken);

    // Refresh Token 무효화 (DB에서 제거)
    if (refreshToken) {
      const decoded = decodeRefreshToken(refreshToken);
      if (decoded && decoded.userId) {
        await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
      }
    }

    // 클라이언트의 쿠키를 삭제
    res.clearCookie("refreshToken");

    res.json({ message: "로그아웃되었습니다." });
  } catch (error) {
    console.error("로그아웃 오류:", error);
    res.status(500).json({ message: "로그아웃 처리 중 오류가 발생했습니다." });
  }
};

// 회원탈퇴
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const accessToken = req.header("Authorization")?.replace("Bearer ", "");

    // Access Token을 블랙리스트에 추가
    if (accessToken) {
      await addToBlacklist(accessToken);
    }

    // 유저 삭제
    await User.findByIdAndDelete(userId);

    res.json({ message: "회원탈퇴가 완료되었습니다." });
  } catch (error) {
    console.error("회원탈퇴 오류:", error);
    res.status(500).json({ message: "회원탈퇴 처리 중 오류가 발생했습니다." });
  }
};

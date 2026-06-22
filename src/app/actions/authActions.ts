"use server";

import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendResetPasswordEmail } from "../../lib/email";

/**
 * Handles the forgot password request.
 * Generates a reset token, saves it to the database, and sends a reset email.
 */
export async function requestPasswordReset(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email wajib diisi." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // To prevent email enumeration attacks, we don't disclose if the email is not registered
    if (!user) {
      return {
        success: true,
        message: "Jika email terdaftar di sistem kami, link reset kata sandi telah dikirim.",
      };
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 3600000); // Token valid for 1 hour

    // Save token and expiry to DB
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpires: tokenExpires,
      },
    });

    // Send the email with the reset link
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    await sendResetPasswordEmail(email, resetUrl);

    return {
      success: true,
      message: "Link reset kata sandi telah dikirim ke email Anda.",
    };
  } catch (error) {
    console.error("Password reset request error:", error);
    return { error: "Terjadi kesalahan internal. Silakan coba beberapa saat lagi." };
  }
}

/**
 * Handles the password reset submission.
 * Verifies the token, hashes the new password, and updates it in the database.
 */
export async function resetPassword(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !token || !password || !confirmPassword) {
    return { error: "Semua kolom wajib diisi." };
  }

  if (password !== confirmPassword) {
    return { error: "Konfirmasi kata sandi tidak cocok." };
  }

  if (password.length < 6) {
    return { error: "Kata sandi minimal harus terdiri dari 6 karakter." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Validate the token and check if it has expired
    if (
      !user ||
      user.resetToken !== token ||
      !user.resetTokenExpires ||
      user.resetTokenExpires < new Date()
    ) {
      return { error: "Token reset kata sandi tidak valid atau telah kedaluwarsa." };
    }

    // Hash the new password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear the reset token fields
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return {
      success: true,
      message: "Kata sandi berhasil diperbarui! Silakan masuk kembali.",
    };
  } catch (error) {
    console.error("Password reset execution error:", error);
    return { error: "Terjadi kesalahan internal saat mereset kata sandi." };
  }
}

import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import db from "@/lib/db";
import User from "@/models/User";

function normalizePhone(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(-10);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export async function POST(request) {
  try {
    await db();

    const {
      name,
      email,
      password,
      city,
      state,
      phone,
      firebaseUid,
    } = await request.json();

    if (!name || !email || !password || !city || !state) {
      return NextResponse.json(
        { success: false, message: "All required fields must be provided" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const normalizedPhone = phone ? normalizePhone(phone) : "";

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      city: String(city).trim(),
      state: String(state).trim(),
      phone: normalizedPhone,
      firebaseUid: String(firebaseUid || "").trim(),
      isEmailVerified: false,
      isPhoneVerified: false,
      role: "citizen",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. Please verify your email before logging in.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          city: user.city,
          state: user.state,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}

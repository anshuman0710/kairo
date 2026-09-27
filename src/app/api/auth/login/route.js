import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

import db from "@/lib/db";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "kairo-nyaysetu-secret-jwt-key-2026";

export async function POST(request) {
  try {
    await db();

    const { email, password, firebaseUid, emailVerified } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    let user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      // If the user does not exist in MongoDB but has been authenticated & verified via Firebase:
      if (emailVerified && firebaseUid) {
        user = await User.create({
          name: normalizedEmail.split("@")[0],
          email: normalizedEmail,
          password: password ? await bcrypt.hash(String(password), 10) : "",
          city: "Jalandhar",
          state: "Punjab",
          firebaseUid: String(firebaseUid),
          isEmailVerified: true,
          isPhoneVerified: false,
          role: "citizen",
        });
      } else {
        return NextResponse.json(
          { success: false, message: "Invalid credentials" },
          { status: 401 }
        );
      }
    } else {
      // Check password if provided and user has a password
      if (password && user.password) {
        const passwordMatch = await bcrypt.compare(String(password), user.password);
        if (!passwordMatch && !emailVerified) {
          return NextResponse.json(
            { success: false, message: "Invalid credentials" },
            { status: 401 }
          );
        }
      }

      // If logging in with verified email, ensure isEmailVerified is updated in MongoDB
      let needsSave = false;
      if (emailVerified && !user.isEmailVerified) {
        user.isEmailVerified = true;
        needsSave = true;
      }
      if (firebaseUid && user.firebaseUid !== firebaseUid) {
        user.firebaseUid = firebaseUid;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          city: user.city,
          state: user.state || "Punjab",
          role: user.role,
          isEmailVerified: Boolean(user.isEmailVerified),
        },
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Login failed" },
      { status: 500 }
    );
  }
}

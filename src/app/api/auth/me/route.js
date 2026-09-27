import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

import db from "@/lib/db";
import User from "@/models/User";

export async function GET(request) {
  try {
    await db();

    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET || "kairo-nyaysetu-secret-jwt-key-2026";
    const decoded = jwt.verify(token, jwtSecret);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (_error) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

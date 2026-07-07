import { ref, push, onValue, off } from "firebase/database";
// Endpoint untuk mengirim pesan ke victim
export async function POST(req: NextRequest) {
  const { victimId, message } = await req.json();
  const session = await getServerSession();
  const senderId = session?.user?.id;
  const chatRef = ref(rtdb, `chats/${victimId}/messages`);
  await push(chatRef, {
    sender: "attacker",
    senderId,
    text: message,
    timestamp: Date.now(),
  });
  return NextResponse.json({ ok: true });
}

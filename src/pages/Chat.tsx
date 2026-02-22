import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Conversation { id: string; participant_one: string; participant_two: string; garage_id?: string | null; spare_part_id?: string | null }
interface Message { id: string; conversation_id: string; sender_id: string; content: string; created_at: string; read: boolean }

const Chat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    fetchConversations();
    const channel = supabase
      .channel("public:messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg: Message = payload.new;
        // if message belongs to selected conversation, append
        setMessages((prev) => (msg.conversation_id === selected ? [...prev, msg] : prev));
        // update conversation list freshness
        fetchConversations();
      })
      .subscribe();

    // open from query param if provided
    const params = new URLSearchParams(location.search);
    const cid = params.get("cid");
    if (cid) openConversation(cid);

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selected]);

  const fetchConversations = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
      .order("updated_at", { ascending: false });
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    setConversations(data || []);
  };

  const openConversation = async (id: string) => {
    setSelected(id);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    setMessages(data || []);
    // mark unread messages as read for this user (messages where sender is not current user)
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", id)
      .neq("sender_id", user?.id)
      .eq("read", false)
      .catch(() => {});
    // tiny scroll to bottom
    setTimeout(() => messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" }), 100);
  };

  const sendMessage = async () => {
    if (!user || !selected || !text.trim()) return;
    const { error } = await supabase.from("messages").insert({ conversation_id: selected, sender_id: user.id, content: text.trim() });
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    setText("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 grid lg:grid-cols-4 gap-6">
        <section className="lg:col-span-1 bg-card rounded-xl p-4">
          <h2 className="font-semibold mb-3">Conversations</h2>
          <div className="space-y-2">
            {conversations.map((c) => {
              const other = c.participant_one === user?.id ? c.participant_two : c.participant_one;
              return (
                <button key={c.id} onClick={() => openConversation(c.id)} className={`w-full text-left p-2 rounded ${selected === c.id ? "bg-muted" : ""}`}>
                  <div className="font-medium truncate">{other}</div>
                  <div className="text-xs text-muted-foreground">{c.garage_id ? "Garage chat" : c.spare_part_id ? "Spare part chat" : "Direct"}</div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-3 bg-card rounded-xl p-4 flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a conversation</div>
          ) : (
            <>
              <div ref={messagesRef} className="flex-1 overflow-auto space-y-3 mb-3 p-2" style={{ maxHeight: "60vh" }}>
                {messages.map((m) => (
                  <div key={m.id} className={`p-2 rounded ${m.sender_id === user?.id ? "bg-primary text-primary-foreground self-end" : "bg-muted"}`}>
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(m.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input value={text} onChange={(e) => setText((e.target as HTMLInputElement).value)} placeholder="Type a message..." />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Chat;

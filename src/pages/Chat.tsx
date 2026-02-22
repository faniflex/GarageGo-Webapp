import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, Send, MessageSquare, ArrowLeft, User } from "lucide-react";

interface Conversation {
  id: string;
  participant_one: string;
  participant_two: string;
  garage_id?: string | null;
  spare_part_id?: string | null;
  updated_at?: string;
  otherName?: string;
  lastMessage?: string;
}
interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read?: boolean;
}

const Chat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();

  // Fetch conversations and enrich with other user's name and last message
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const load = async () => {
      setLoadingConvs(true);
      const { data: convs, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
        .order("updated_at", { ascending: false });
      if (!mounted) return;
      if (error) {
        setLoadingConvs(false);
        return toast({ title: "Error", description: error.message, variant: "destructive" });
      }
      const convList = (convs || []) as Conversation[];

      // fetch other participant profiles
      const otherIds = convList.map((c) => (c.participant_one === user.id ? c.participant_two : c.participant_one));
      const uniqueOtherIds = Array.from(new Set(otherIds));
      const { data: profiles } = await supabase.from("profiles").select("id,full_name").in("id", uniqueOtherIds);
      const nameMap: Record<string, string> = {};
      (profiles || []).forEach((p: any) => (nameMap[p.id] = p.full_name || "User"));

      // fetch last messages in bulk
      const convIds = convList.map((c) => c.id);
      const { data: lastMsgs } = await supabase
        .from("messages")
        .select("conversation_id,content,created_at")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: false });

      const lastMap: Record<string, { content: string; created_at: string }> = {};
      (lastMsgs || []).forEach((m: any) => {
        if (!lastMap[m.conversation_id]) lastMap[m.conversation_id] = { content: m.content, created_at: m.created_at };
      });

      const enriched = convList.map((c) => {
        const otherId = c.participant_one === user.id ? c.participant_two : c.participant_one;
        return {
          ...c,
          otherName: nameMap[otherId] || "User",
          lastMessage: lastMap[c.id]?.content || "",
        } as Conversation;
      });

      setConversations(enriched);
      setLoadingConvs(false);

      // auto-select from query param
      const convId = searchParams.get("id") || new URLSearchParams(location.search).get("id");
      if (convId && enriched.find((x) => x.id === convId)) setSelectedId(convId);
    };
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, searchParams]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedId) return;
    let mounted = true;
    const load = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedId)
        .order("created_at", { ascending: true });
      if (!mounted) return;
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      setMessages((data || []) as Message[]);

      // mark unread as read
      if (user) {
        await supabase
          .from("messages")
          .update({ read: true })
          .eq("conversation_id", selectedId)
          .neq("sender_id", user.id)
          .eq("read", false)
          .catch(() => {});
      }
      // scroll
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    };
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, user]);

  // Realtime subscription for selected conversation
  useEffect(() => {
    if (!selectedId) return;
    const channel = supabase
      .channel(`messages:conv:${selectedId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedId}` }, (payload) => {
        const msg: Message = payload.new;
        setMessages((prev) => [...prev, msg]);
        // refresh conversation list freshness
        (async () => {
          const { data } = await supabase.from("conversations").select("*").eq("id", selectedId).limit(1);
          if (data && data[0]) {
            setConversations((prev) => prev.map((c) => (c.id === selectedId ? { ...c, updated_at: data[0].updated_at } : c)));
          }
        })();
      })
      .subscribe();

    return () => void supabase.removeChannel(channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const selected = conversations.find((c) => c.id === selectedId) || null;
  const showSidebar = !isMobile || !selectedId;
  const showChat = !isMobile || !!selectedId;

  const sendMessage = async () => {
    if (!user || !selectedId || !newMsg.trim()) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({ conversation_id: selectedId, sender_id: user.id, content: newMsg.trim() });
    setSending(false);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    setNewMsg("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 container py-6 flex gap-4 overflow-hidden" style={{ height: "calc(100vh - 4rem)" }}>
        <div className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 4rem)" }}>
          {/* Sidebar */}
          {showSidebar && (
            <div className="w-72 shrink-0 bg-card rounded-xl border overflow-y-auto">
              <div className="p-4 border-b">
                <h2 className="font-heading font-semibold">Messages</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loadingConvs ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground text-center">No conversations yet.</p>
                ) : (
                  conversations.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedId(c.id);
                        try {
                          navigate(`?id=${c.id}`);
                        } catch (e) {}
                      }}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-border/50 transition-colors hover:bg-muted/60 ${
                        selectedId === c.id ? "bg-muted" : ""
                      }`}
                    >
                      <p className="font-medium text-sm truncate">{c.otherName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(c.updated_at || "").toLocaleDateString?.() || ""}
                      </p>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <p className="font-medium text-sm truncate">{c.otherName}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                            {c.updated_at ? new Date(c.updated_at).toLocaleDateString() : ""}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessage || "Start a conversation"}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Chat panel */}
          {showChat && (
            <div className="flex-1 flex flex-col overflow-hidden bg-background">
              {!selected ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mb-3" />
                  <p>Select a conversation to start chatting</p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="px-4 py-3 border-b bg-card flex items-center gap-3">
                    {isMobile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => {
                          setSelectedId(null);
                          try {
                            navigate("/chat");
                          } catch (e) {}
                        }}
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </Button>
                    )}
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-sm">{selected.otherName}</h3>
                      <p className="text-xs text-primary">Online</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {messages.map((m) => {
                      const isMine = m.sender_id === user?.id;
                      return (
                        <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                              isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card border rounded-bl-md"
                            }`}
                          >
                            <p>{m.content}</p>
                            <p className={`text-[10px] mt-1 text-right ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                              {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t bg-card flex items-center gap-2">
                    <Input
                      value={newMsg}
                      onChange={(e) => setNewMsg((e.target as HTMLInputElement).value)}
                      placeholder="Type Your Message here"
                      className="rounded-full bg-muted border-0 px-4"
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    />
                    <Button onClick={sendMessage} disabled={sending || !newMsg.trim()} size="icon" className="rounded-full shrink-0">
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;

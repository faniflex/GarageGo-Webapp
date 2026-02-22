import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AdminPanel = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<"garages" | "parts" | "users">("garages");
  const [garages, setGarages] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchAll();
  }, [tab]);

  const fetchAll = async () => {
    if (tab === "garages") {
      const { data, error } = await supabase.from("garages").select("*");
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      setGarages(data || []);
    } else if (tab === "parts") {
      const { data, error } = await supabase.from("spare_parts").select("*");
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      setParts(data || []);
    } else {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      setUsers(data || []);
    }
  };

  const toggleVerify = async (g: any) => {
    const { error } = await supabase.from("garages").update({ verified: !g.verified }).eq("id", g.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Updated" });
    fetchAll();
  };

  const toggleAvailable = async (p: any) => {
    const { error } = await supabase.from("spare_parts").update({ available: !p.available }).eq("id", p.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Updated" });
    fetchAll();
  };

  const del = async (table: string, id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Deleted" });
    fetchAll();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <h1 className="text-2xl font-heading font-bold mb-4">Admin Panel</h1>

        <div className="flex gap-2 mb-4">
          <Button variant={tab === "garages" ? "default" : "ghost"} onClick={() => setTab("garages")}>Garages</Button>
          <Button variant={tab === "parts" ? "default" : "ghost"} onClick={() => setTab("parts")}>Spare Parts</Button>
          <Button variant={tab === "users" ? "default" : "ghost"} onClick={() => setTab("users")}>Users</Button>
        </div>

        {tab === "garages" && (
          <div className="overflow-x-auto">
            <table className="table-fixed w-full">
              <thead>
                <tr className="text-left text-sm text-muted-foreground">
                  <th>Name</th>
                  <th>Owner</th>
                  <th>Address</th>
                  <th>Verified</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {garages.map((g) => (
                  <tr key={g.id} className="border-t">
                    <td className="py-2">{g.name}</td>
                    <td className="py-2">{g.owner_id}</td>
                    <td className="py-2">{g.address}</td>
                    <td className="py-2">{String(!!g.verified)}</td>
                    <td className="py-2 flex gap-2">
                      <Button size="sm" onClick={() => toggleVerify(g)}>{g.verified ? "Unverify" : "Verify"}</Button>
                      <Button size="sm" variant="destructive" onClick={() => del("garages", g.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "parts" && (
          <div className="overflow-x-auto">
            <table className="table-fixed w-full">
              <thead>
                <tr className="text-left text-sm text-muted-foreground">
                  <th>Name</th>
                  <th>Seller</th>
                  <th>Price</th>
                  <th>Available</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {parts.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">{p.seller_id}</td>
                    <td className="py-2">{p.price}</td>
                    <td className="py-2">{String(!!p.available)}</td>
                    <td className="py-2 flex gap-2">
                      <Button size="sm" onClick={() => toggleAvailable(p)}>{p.available ? "Hide" : "Show"}</Button>
                      <Button size="sm" variant="destructive" onClick={() => del("spare_parts", p.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "users" && (
          <div className="overflow-x-auto">
            <table className="table-fixed w-full">
              <thead>
                <tr className="text-left text-sm text-muted-foreground">
                  <th>Id</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="py-2">{u.id}</td>
                    <td className="py-2">{u.email || u.user_email || "-"}</td>
                    <td className="py-2">{u.role || "user"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;

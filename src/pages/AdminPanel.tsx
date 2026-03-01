import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type GarageRow = {
  id: string;
  name: string | null;
  owner_id: string | null;
  address: string | null;
  verified: boolean | null;
};

type SparePartRow = {
  id: string;
  name: string | null;
  seller_id: string | null;
  price: number | null;
  available: boolean | null;
};

type UserRow = {
  id: string;
  email: string | null;
  user_email: string | null;
  role: string | null;
};

type MutableTable = "garages" | "spare_parts";

const AdminPanel = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"garages" | "parts" | "users">("garages");
  const [garages, setGarages] = useState<GarageRow[]>([]);
  const [parts, setParts] = useState<SparePartRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/admin/login", { replace: true });
        return;
      }
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });
      if (!isAdmin) {
        await supabase.auth.signOut();
        navigate("/admin/login", { replace: true });
        return;
      }
      setIsAuthorized(true);
    };
    checkAdmin();
  }, [navigate]);

  const fetchAll = useCallback(async () => {
    if (tab === "garages") {
      const { data, error } = await supabase.from("garages").select("*");
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      setGarages((data ?? []) as GarageRow[]);
    } else if (tab === "parts") {
      const { data, error } = await supabase.from("spare_parts").select("*");
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      setParts((data ?? []) as SparePartRow[]);
    } else {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
      setUsers((data ?? []) as UserRow[]);
    }
  }, [tab, toast]);

  useEffect(() => {
    if (!isAuthorized) return;
    fetchAll();
  }, [isAuthorized, fetchAll]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  const toggleVerify = async (g: GarageRow) => {
    const { error } = await supabase.from("garages").update({ verified: !g.verified }).eq("id", g.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Updated" });
    fetchAll();
  };

  const toggleAvailable = async (p: SparePartRow) => {
    const { error } = await supabase.from("spare_parts").update({ available: !p.available }).eq("id", p.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Updated" });
    fetchAll();
  };

  const del = async (table: MutableTable, id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Deleted" });
    fetchAll();
  };

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        {isAuthorized && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-heading font-bold">Admin Panel</h1>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>

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
          </>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw, Search, Trash2, MessageSquare, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PlaygroundMessage {
  id: string;
  playground_id: string;
  nickname: string;
  message: string;
  user_id: string;
  created_at: string | null;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<PlaygroundMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("playground_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      toast.error("Errore caricamento messaggi");
      console.error(error);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase
      .from("playground_messages")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Errore eliminazione messaggio");
      console.error(error);
    } else {
      toast.success("Messaggio eliminato");
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
    setDeleting(null);
  };

  const filtered = messages.filter(
    (m) =>
      m.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.playground_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold arcade-heading">MODERAZIONE MESSAGGI</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cerca messaggio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={fetchMessages} variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Totale messaggi: <span className="text-primary font-bold">{messages.length}</span>
      </div>

      <div className="grid gap-3">
        {filtered.map((msg) => (
          <div
            key={msg.id}
            className="arcade-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <User className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-bold text-sm">{msg.nickname}</span>
                <span className="text-xs text-muted-foreground">
                  📍 {msg.playground_id}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm break-words">{msg.message}</p>
              </div>
              {msg.created_at && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {format(new Date(msg.created_at), "dd MMM yyyy HH:mm", { locale: it })}
                </div>
              )}
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleting === msg.id}
                  className="flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  ELIMINA
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vuoi eliminare il messaggio di <strong>{msg.nickname}</strong>?
                    Questa azione non può essere annullata.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ANNULLA</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(msg.id)}>
                    ELIMINA
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nessun messaggio trovato
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;

"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateNote } from "@/hooks/use-scheduler";

interface EventNoteItem {
  id: string;
  content: string;
  authorType: string;
  authorName: string | null;
  createdAt: string | Date;
}

interface EventNotesChatProps {
  eventId: string;
  notes: EventNoteItem[];
  authorType: "OWNER" | "GUEST";
  authorName?: string;
}

export function EventNotesChat({
  eventId,
  notes,
  authorType,
  authorName,
}: EventNotesChatProps) {
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const createNote = useCreateNote(eventId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [notes]);

  const handleSend = async () => {
    if (!message.trim()) return;
    await createNote.mutateAsync({
      content: message.trim(),
      authorType,
      authorName,
    });
    setMessage("");
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Notas / conversación</p>
      <ScrollArea className="h-48 rounded-md border p-3">
        <div ref={scrollRef} className="space-y-3">
          {notes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Sin mensajes aún. Escribe la primera nota.
            </p>
          )}
          {notes.map((note) => (
            <div
              key={note.id}
              className={`flex flex-col gap-1 ${
                note.authorType === authorType ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  note.authorType === "OWNER"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {note.content}
              </div>
              <span className="text-xs text-muted-foreground">
                {note.authorName ??
                  (note.authorType === "OWNER" ? "Dueño" : "Invitado")}{" "}
                ·{" "}
                {format(new Date(note.createdAt), "d MMM HH:mm", {
                  locale: es,
                })}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="flex gap-2">
        <Textarea
          placeholder="Escribe una nota..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || createNote.isPending}
          className="self-end"
        >
          Enviar
        </Button>
      </div>
    </div>
  );
}

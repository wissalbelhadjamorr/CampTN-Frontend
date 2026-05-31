"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, Search } from "lucide-react";
import { authFetch } from "@/services/api";

const MessagesPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConversation = useCallback((conv) => {
    setSelectedConv(conv);
    socket?.emit("getConversation", { interlocuteurId: conv.interlocuteur.utilisateur_id });
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("getConversations");

    socket.on("conversations", (data) => {
      setConversations(data);
      setLoadingConvs(false);

      const destinataireId = searchParams.get("destinataire");
      if (destinataireId) {
        const conv = data.find(
          (c) => c.interlocuteur.utilisateur_id === parseInt(destinataireId)
        );
        if (conv) {
          handleSelectConversation(conv);
        } else {
          authFetch(`/utilisateur/${destinataireId}`).then((interlocuteur) => {
            if (interlocuteur) {
              const newConv = { interlocuteur, dernierMessage: null };
              setSelectedConv(newConv);
              socket.emit("getConversation", { interlocuteurId: parseInt(destinataireId) });
            }
          }).catch(() => {});
        }
      }
    });

    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
      socket.emit("getConversations");
    });

    socket.on("messageSent", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("conversation", (data) => {
      setMessages(data);
    });

    return () => {
      socket.off("conversations");
      socket.off("receiveMessage");
      socket.off("messageSent");
      socket.off("conversation");
    };
  }, [socket, searchParams, handleSelectConversation]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedConv) return;
    socket.emit("sendMessage", {
      destinataireId: selectedConv.interlocuteur.utilisateur_id,
      contenu: newMessage.trim(),
    });
    setNewMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredConvs = conversations.filter((conv) => {
    const name = `${conv.interlocuteur.prenom} ${conv.interlocuteur.nom}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const getInitials = (prenom, nom) =>
    `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <div className="container mx-auto p-6 h-[calc(100vh-80px)]">
      {/* Titre */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messagerie</h1>
        <p className="text-sm text-gray-400 mt-0.5">Vos conversations en temps réel</p>
      </div>

      <div className="flex h-[calc(100%-72px)] rounded-2xl overflow-hidden border border-border shadow-xl bg-white dark:bg-zinc-900">

        {/* Sidebar conversations */}
        <div className="w-80 flex flex-col border-r border-border bg-gray-50 dark:bg-zinc-900">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-white dark:bg-zinc-800 border-border rounded-lg"
              />
            </div>
          </div>

          {/* Liste */}
          <div className="overflow-y-auto flex-1">
            {loadingConvs ? (
              <div className="flex flex-col gap-3 p-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-700 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-100 dark:bg-zinc-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                <MessageSquare className="h-8 w-8 mb-2 text-gray-300 dark:text-zinc-600" />
                <p className="text-xs text-gray-400">Aucune conversation trouvée</p>
              </div>
            ) : (
              filteredConvs.map((conv) => {
                const isActive = selectedConv?.interlocuteur.utilisateur_id === conv.interlocuteur.utilisateur_id;
                return (
                  <div
                    key={conv.interlocuteur.utilisateur_id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`flex items-center gap-3 px-3 py-3 cursor-pointer border-b border-border/50 transition-all ${
                      isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-l-2 border-l-emerald-500"
                        : "hover:bg-white dark:hover:bg-zinc-800"
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isActive
                        ? "bg-emerald-500 text-white"
                        : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                    }`}>
                      {getInitials(conv.interlocuteur.prenom, conv.interlocuteur.nom)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-semibold truncate ${isActive ? "text-emerald-700 dark:text-emerald-300" : "text-gray-800 dark:text-gray-100"}`}>
                          {conv.interlocuteur.prenom} {conv.interlocuteur.nom}
                        </p>
                        {conv.dernierMessage && (
                          <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                            {formatDate(conv.dernierMessage.date)}
                          </span>
                        )}
                      </div>
                      {conv.dernierMessage ? (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{conv.dernierMessage.contenu}</p>
                      ) : (
                        <p className="text-xs text-gray-300 italic mt-0.5">Nouvelle conversation</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Zone messages */}
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900">
          {selectedConv ? (
            <>
              {/* Header */}
              <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-white dark:bg-zinc-900 shadow-sm">
                <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {getInitials(selectedConv.interlocuteur.prenom, selectedConv.interlocuteur.nom)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    {selectedConv.interlocuteur.prenom} {selectedConv.interlocuteur.nom}
                  </p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium capitalize bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    {selectedConv.interlocuteur.role}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50 dark:bg-zinc-950">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-emerald-400" />
                    </div>
                    <p className="text-sm text-gray-400">Commencez la conversation !</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.expediteur.utilisateur_id === user?.id;
                    return (
                      <div key={msg.message_id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        {!isMine && (
                          <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-[10px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0 mr-2 mt-1">
                            {getInitials(msg.expediteur.prenom, msg.expediteur.nom)}
                          </div>
                        )}
                        <div className={`max-w-sm px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          isMine
                            ? "bg-emerald-500 text-white rounded-br-sm"
                            : "bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 rounded-bl-sm border border-border"
                        }`}>
                          <p className="leading-relaxed">{msg.contenu}</p>
                          <p className={`text-[10px] mt-1 text-right ${isMine ? "text-emerald-100" : "text-gray-400"}`}>
                            {formatTime(msg.date)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-border bg-white dark:bg-zinc-900 flex gap-2 items-center">
                <Input
                  placeholder="Écrire un message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 rounded-xl bg-gray-50 dark:bg-zinc-800 border-border text-sm"
                />
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-4 shrink-0 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center bg-gray-50 dark:bg-zinc-950">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                <MessageSquare className="h-7 w-7 text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sélectionnez une conversation</p>
              <p className="text-xs text-gray-300 dark:text-gray-600">pour commencer à échanger</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
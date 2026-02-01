"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    
    socketRef.current = io({
      path: "/api/socket",
    });

    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinUserRoom = (userId: string) => {
    socketRef.current?.emit("join-user", userId);
  };

  const joinListingRoom = (listingId: string) => {
    socketRef.current?.emit("join-listing", listingId);
  };

  const placeBid = (data: { listingId: string; bidAmount: number; userId: string }) => {
    socketRef.current?.emit("place-bid", data);
  };

  const sendNotification = (data: { userId: string; notification: any }) => {
    socketRef.current?.emit("send-notification", data);
  };

  const onNewBid = (callback: (data: any) => void) => {
    socketRef.current?.on("new-bid", callback);
    return () => socketRef.current?.off("new-bid", callback);
  };

  const onNotification = (callback: (notification: any) => void) => {
    socketRef.current?.on("notification", callback);
    return () => socketRef.current?.off("notification", callback);
  };

  return {
    socket: socketRef.current,
    joinUserRoom,
    joinListingRoom,
    placeBid,
    sendNotification,
    onNewBid,
    onNotification,
  };
}
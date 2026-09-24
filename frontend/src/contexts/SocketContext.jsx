import { createContext, useContext, useState } from "react";
import socketService from "../services/socketService";

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  const connect = (token) => {
    const socketInstance = socketService.connect(token);
    setSocket(socketInstance);
    return socketInstance;
  };

  const disconnect = () => {
    socketService.disconnect();
    setSocket(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connect,
        disconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
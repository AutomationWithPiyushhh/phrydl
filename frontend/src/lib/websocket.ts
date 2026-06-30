import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://185.2.102.63:8080/api/v1').replace('http', 'ws').replace('/api/v1', '/ws');

export function useWebSocket() {
  const { token } = useAuth();
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('Connected to WebSocket');
      
      // Subscribe to personal notifications
      client.subscribe('/user/queue/notifications', (message) => {
        const notification = JSON.parse(message.body);
        console.log('New notification:', notification);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      });

      // Subscribe to global KPI updates
      client.subscribe('/topic/kpi-updates', (message) => {
        const payload = JSON.parse(message.body);
        console.log('KPI Update received:', payload);
        queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        queryClient.invalidateQueries({ queryKey: ['complaints'] });
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();
    setStompClient(client);

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [token]);

  return stompClient;
}

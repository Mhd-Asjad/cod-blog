import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setUnreadCount } from '@/store/notificationsSlice';
const WebSocketManager = () => {
  const reduxUser = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const connectWebSocket = () => {  
    if (!reduxUser?.id) return;
    
    const socket = new WebSocket(`${import.meta.VITE_WEBSOCKET_URL}/ws/notifications/${reduxUser.id}/`);
    console.log(socket)
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
    };


    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("📨 Incoming Notification:", data);

      if (data.type === "follow_notification"){ 
        dispatch(setUnreadCount(data.unread_count))
        toast.success(data.message)

      } else if(data.type === "like_notification"){
        dispatch(setUnreadCount(data.unread_count))
        toast.success(data.message)

      }else {
        dispatch(setUnreadCount(data.unread_count))
        toast.success(data?.notification)
      }

      if (notifications){
        alert(data.notifications)
      }
    } 


    socket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    socket.onclose = () => {
      console.warn('🔌 WebSocket disconnected');
      setIsConnected(false);

      if (!reconnectTimerRef.current) {
        reconnectTimerRef.current = setTimeout(() => {
          connectWebSocket();
          reconnectTimerRef.current = null;
        }, 3000); // Retry every 3 seconds
      }
    };
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [reduxUser?.id]);

  return null; 
};

export default WebSocketManager;

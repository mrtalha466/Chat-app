import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {

            const response = await axiosInstance.get("/messages/users")
            set({ users: response.data })

        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isUsersLoading: false })
        }
    },
    getMessages: async (userId) => {
        set({ isMessagesLoading: true })
        try {
            const response = await axiosInstance.get(`/messages/${userId}`)
            set({ messages: response.data })
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isMessagesLoading: false })
        }
    },
    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const response = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, response.data] })
        } catch (error) {
            toast.error(error.response.data.message || "Something went wrong");



        }
    },
   subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;

    if (!socket) {
      console.warn("Socket not connected");
      return;
    }

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, users } = get();

      //  Toast & browser notification
      toast.success(`📨 New message from ${newMessage.senderName || "a user"}`);
      if (Notification.permission === "granted") {
        new Notification("New Message", {
          body: `From ${newMessage.senderName || "Someone"}: ${newMessage.text}`,
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
      }

      //  Add to chat if from selected user
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        set(state => ({
          messages: [...state.messages, newMessage],
        }));
      }

      //  Update unread count
      if (users.length > 0) {
        set(state => ({
          users: state.users.map(user =>
            user._id === newMessage.senderId
              ? { ...user, unreadCount: (user.unreadCount || 0) + 1 }
              : user
          )
        }));
      }
    });
  },
unSubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },
 setSelectUser: (selectedUser) => {
  set(state => {
    if (!selectedUser) {
      return { selectedUser: null };
    }

    return {
      selectedUser,
      users: state.users.map(user =>
        user._id === selectedUser._id
          ? { ...user, unreadCount: 0 }
          : user
      ),
    };
  });
},

}));

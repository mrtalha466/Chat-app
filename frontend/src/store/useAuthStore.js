import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/"

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingUp: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const response = await axiosInstance.get("/auth/check");

            set({ authUser: response.data })
            get().connectSocket()
        } catch (error) {
            console.log("Error checking auth:", error);
            set({ authUser: null })
        } finally {
            set({ isCheckingAuth: false })
        }
    },
    signUp: async (data) => {
        set({ isSigningUp: true })
        try {
            const response = await axiosInstance.post("/auth/signup", data)
            set({ authUser: response.data })
            toast.success("Account Created Succesfully")
            get().connectSocket()

        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
            console.log("error in signup:", error);

        } finally {
            set({ isSigningUp: false })
        }
    },
    login: async (data) => {
        set({ isLoggingUp: true })
        try {
            const response = await axiosInstance.post("/auth/login", data)
            set({ authUser: response.data })
            toast.success("Login Succesfully")
            get().connectSocket()
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
        } finally {
            set({ isLoggingUp: false })
        }
    },
    logOut: async () => {
        try {
            await axiosInstance.post("/auth/logout")
            set({ authUser: null })
            toast.success("Logged Out Succesfully")
            get().disconnectSocket()
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    },
    upadeProfile: async (data) => {
        set({ isUpdatingProfile: true })
        try {
            const response = await axiosInstance.put("/auth/update-profile", data)
            set({ authUser: response.data })
            toast.success("Profile updated successfully")
        } catch (error) {
            console.log("error profile image", error)
            toast.error(error?.response?.data?.message || "Something went wrong");
        } finally {
            set({ isUpdatingProfile: false })
        }
    },

    connectSocket: () => {
        const { authUser } = get()
        if (!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        });
        socket.connect();

        set({ socket: socket })

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds })
        })
    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect()
    }

}))
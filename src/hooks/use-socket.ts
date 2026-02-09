'use client'

import { useEffect, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { create } from 'zustand'

interface TypingUser {
  userId: string
  displayName: string
}

interface SocketState {
  isConnected: boolean
  onlineUsers: Set<string>
  typingUsers: Map<string, TypingUser[]> // conversationId -> typing users
  setConnected: (connected: boolean) => void
  addOnlineUser: (userId: string) => void
  removeOnlineUser: (userId: string) => void
  setOnlineUsers: (userIds: string[]) => void
  setTypingUsers: (conversationId: string, users: TypingUser[]) => void
  addTypingUser: (conversationId: string, user: TypingUser) => void
  removeTypingUser: (conversationId: string, userId: string) => void
}

export const useSocketStore = create<SocketState>((set) => ({
  isConnected: false,
  onlineUsers: new Set<string>(),
  typingUsers: new Map<string, TypingUser[]>(),
  setConnected: (connected) => set({ isConnected: connected }),
  addOnlineUser: (userId) =>
    set((state) => {
      const newSet = new Set(state.onlineUsers)
      newSet.add(userId)
      return { onlineUsers: newSet }
    }),
  removeOnlineUser: (userId) =>
    set((state) => {
      const newSet = new Set(state.onlineUsers)
      newSet.delete(userId)
      return { onlineUsers: newSet }
    }),
  setOnlineUsers: (userIds) =>
    set({ onlineUsers: new Set(userIds) }),
  setTypingUsers: (conversationId, users) =>
    set((state) => {
      const newMap = new Map(state.typingUsers)
      newMap.set(conversationId, users)
      return { typingUsers: newMap }
    }),
  addTypingUser: (conversationId, user) =>
    set((state) => {
      const newMap = new Map(state.typingUsers)
      const existing = newMap.get(conversationId) ?? []
      if (!existing.find((u) => u.userId === user.userId)) {
        newMap.set(conversationId, [...existing, user])
      }
      return { typingUsers: newMap }
    }),
  removeTypingUser: (conversationId, userId) =>
    set((state) => {
      const newMap = new Map(state.typingUsers)
      const existing = newMap.get(conversationId) ?? []
      newMap.set(
        conversationId,
        existing.filter((u) => u.userId !== userId)
      )
      return { typingUsers: newMap }
    }),
}))

let globalSocket: Socket | null = null

function getSocket(): Socket {
  if (!globalSocket) {
    globalSocket = io({
      path: '/api/socketio',
      autoConnect: false,
    })
  }
  return globalSocket
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { setConnected, addOnlineUser, removeOnlineUser, setOnlineUsers, addTypingUser, removeTypingUser } =
    useSocketStore()

  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket

    if (!socket.connected) {
      socket.connect()
    }

    socket.on('connect', () => {
      setConnected(true)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('user:online', (userId: string) => {
      addOnlineUser(userId)
    })

    socket.on('user:offline', (userId: string) => {
      removeOnlineUser(userId)
    })

    socket.on('users:online', (userIds: string[]) => {
      setOnlineUsers(userIds)
    })

    socket.on(
      'user:typing',
      (data: { conversationId: string; userId: string; displayName: string }) => {
        addTypingUser(data.conversationId, {
          userId: data.userId,
          displayName: data.displayName,
        })
      }
    )

    socket.on(
      'user:stopTyping',
      (data: { conversationId: string; userId: string }) => {
        removeTypingUser(data.conversationId, data.userId)
      }
    )

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('user:online')
      socket.off('user:offline')
      socket.off('users:online')
      socket.off('user:typing')
      socket.off('user:stopTyping')
    }
  }, [setConnected, addOnlineUser, removeOnlineUser, setOnlineUsers, addTypingUser, removeTypingUser])

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:join', conversationId)
  }, [])

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:leave', conversationId)
  }, [])

  const sendMessage = useCallback(
    (data: {
      conversationId: string
      message: {
        id: string
        content: string | null
        type: string
        senderId: string
        sender: {
          id: string
          username: string
          displayName: string
          avatarUrl: string | null
        }
        createdAt: Date
        replyTo?: {
          id: string
          content: string | null
          sender: { id: string; displayName: string }
        } | null
      }
    }) => {
      socketRef.current?.emit('message:send', data)
    },
    []
  )

  const startTyping = useCallback(
    (conversationId: string, displayName: string) => {
      socketRef.current?.emit('typing:start', { conversationId, displayName })

      // 3초 후 자동 타이핑 중단
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing:stop', { conversationId })
      }, 3000)
    },
    []
  )

  const stopTyping = useCallback((conversationId: string) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    socketRef.current?.emit('typing:stop', { conversationId })
  }, [])

  const onNewMessage = useCallback(
    (callback: (data: { conversationId: string; message: Record<string, unknown> }) => void) => {
      const socket = socketRef.current ?? getSocket()
      socket.on('message:new', callback)
      return () => {
        socket.off('message:new', callback)
      }
    },
    []
  )

  return {
    socket: socketRef.current,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    onNewMessage,
  }
}

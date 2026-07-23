import React from 'react'
import { Modal, View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAlertState, useAlertActions } from '@/context/AlertContext'

const ICONS = {
  error: { name: 'close-circle' as const, color: '#FF5C5C' },
  success: { name: 'checkmark-circle' as const, color: '#2ECC71' },
  info: { name: 'information-circle' as const, color: '#6C5CE7' },
}

export const AlertModal = () => {
  const { visible, title, message, type } = useAlertState()
  const { hide } = useAlertActions()
  const icon = ICONS[type]

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={hide}>
      <View className="flex-1 items-center justify-center bg-black/60 px-8">
        <View className="w-full max-w-sm rounded-2xl bg-[#1A1A2E] p-6 border border-white/10">
          <View className="items-center mb-3">
            <Ionicons name={icon.name} size={40} color={icon.color} />
          </View>

          <Text className="text-foreground text-lg font-bold text-center mb-1">
            {title}
          </Text>
          <Text className="text-foreground-muted text-sm text-center mb-5">
            {message}
          </Text>

          <Pressable
            onPress={hide}
            className="bg-primary rounded-xl py-3 items-center active:opacity-80"
          >
            <Text className="text-white font-semibold">OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}
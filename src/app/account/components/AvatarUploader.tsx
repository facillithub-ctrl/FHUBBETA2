'use client'

import React, { useState } from 'react'
// CORREÇÃO: Import sem chaves
import createClient from '@/utils/supabase/client' 
import { Camera, Loader2, User } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/contexts/ToastContext' // Confirme este caminho também

export default function AvatarUploader({ 
  url, 
  onUpload, 
  size = 150 
}: { 
  url: string | null
  onUpload: (url: string) => void
  size?: number
}) {
  const supabase = createClient()
  // ... resto do código igual ...
  // Vou manter o código curto para não encher a resposta, a lógica é a mesma do passo anterior
  // O importante é a linha do import createClient
  
  const [uploading, setUploading] = useState(false)
  const { addToast } = useToast()

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você precisa selecionar uma imagem para fazer o upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)
      addToast('Avatar atualizado com sucesso!', 'success')
    } catch (error: any) {
      addToast('Erro ao atualizar avatar: ' + error.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className="relative group rounded-full overflow-hidden bg-neutral-100 border-4 border-white shadow-lg"
        style={{ width: size, height: size }}
      >
        {url ? (
          <Image
            src={url} 
            alt="Avatar"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-400">
            <User size={size * 0.5} />
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <label className="cursor-pointer flex flex-col items-center text-white gap-1 p-2">
            {uploading ? <Loader2 className="animate-spin" /> : <Camera />}
            <span className="text-xs font-medium">Alterar</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from 'react'
import config from 'src/constants/config'
import { toast } from 'react-toastify'

interface Props {
  onChange?: (file?: File) => void
}

export default function InputFile({ onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileFromLocal = e.target.files?.[0]
    if (fileFromLocal && (fileFromLocal.size >= config.maxSizeUploadAvatar || !fileFromLocal.type.includes('image'))) {
      toast.error('File ko đúng định dạng qui định')
    } else {
      // setFile(fileFromLocal)
      onChange && onChange(fileFromLocal)
    }
  }
  const handleUpload = () => {
    fileInputRef.current?.click()
  }
  return (
    <>
      <input
        onChange={onFileChange}
        ref={fileInputRef}
        className='hidden'
        type='file'
        accept='.jpg,.jpeg,.png'
        onClick={(e) => {
          ;(e.target as any).value = null
        }}
      ></input>
      <button
        type='button'
        onClick={handleUpload}
        className='flex items-center justify-end h-10 px-6 text-sm text-gray-600 bg-white border rounded-sm shadow-sm'
      >
        Chọn ảnh
      </button>
    </>
  )
}

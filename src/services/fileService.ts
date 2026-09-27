import { Upload } from 'tus-js-client'
import { auth } from '../firebase'
import { supabase, supabasePublishableKey, supabaseUrl } from '../lib/supabase'

const BUCKET_NAME = 'files'
const TUS_CHUNK_SIZE = 6 * 1024 * 1024

export type StoredFile = {
  id: string
  user_id: string
  name: string
  storage_path: string
  size: number
  mime_type: string
  created_at: string
}

export type UploadProgress = (
  percentage: number,
  bytesUploaded: number,
  bytesTotal: number,
) => void

export async function uploadFile(file: File, onProgress?: UploadProgress) {
  const user = requireCurrentUser()
  const storagePath = `${user.uid}/${safeFileName(file.name)}`
  const firebaseToken = await user.getIdToken(false)

  await uploadWithTus(file, storagePath, firebaseToken, onProgress)

  const { data, error } = await supabase
    .from('files')
    .insert({
      user_id: user.uid,
      name: file.name,
      storage_path: storagePath,
      size: file.size,
      mime_type: file.type || 'application/octet-stream',
    })
    .select('id, user_id, name, storage_path, size, mime_type, created_at')
    .single()

  if (error) {
    await supabase.storage.from(BUCKET_NAME).remove([storagePath])
    throw error
  }

  return data as StoredFile
}

export async function loadFiles() {
  const user = requireCurrentUser()
  const { data, error } = await supabase
    .from('files')
    .select('id, user_id, name, storage_path, size, mime_type, created_at')
    .eq('user_id', user.uid)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as StoredFile[]
}

export async function downloadFile(file: StoredFile) {
  requireCurrentUser()
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(file.storage_path)

  if (error) throw error

  const url = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function deleteFile(file: StoredFile) {
  const user = requireCurrentUser()
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([file.storage_path])

  if (storageError) throw storageError

  const { error: metadataError } = await supabase
    .from('files')
    .delete()
    .eq('id', file.id)
    .eq('user_id', user.uid)

  if (metadataError) throw metadataError
}

function uploadWithTus(
  file: File,
  storagePath: string,
  firebaseToken: string,
  onProgress?: UploadProgress,
) {
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
  const endpoint = `https://${projectRef}.storage.supabase.co/storage/v1/upload/resumable`

  return new Promise<void>((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        apikey: supabasePublishableKey,
        authorization: `Bearer ${firebaseToken}`,
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      chunkSize: TUS_CHUNK_SIZE,
      metadata: {
        bucketName: BUCKET_NAME,
        objectName: storagePath,
        contentType: file.type || 'application/octet-stream',
        cacheControl: '3600',
      },
      onError: reject,
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = bytesTotal === 0
          ? 0
          : Math.round((bytesUploaded / bytesTotal) * 100)
        onProgress?.(percentage, bytesUploaded, bytesTotal)
      },
      onSuccess: () => resolve(),
    })

    void upload.findPreviousUploads()
      .then((previousUploads) => {
        if (previousUploads.length > 0) {
          upload.resumeFromPreviousUpload(previousUploads[0])
        }
        upload.start()
      })
      .catch(reject)
  })
}

function requireCurrentUser() {
  const user = auth.currentUser
  if (!user) throw new Error('Utilisateur Firebase non connecté')
  return user
}

function safeFileName(fileName: string) {
  return fileName.replace(/[\\/]/g, '_')
}

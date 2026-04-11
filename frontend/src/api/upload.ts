import api from './index'

export interface CheckFileResult {
  exists: boolean
  filePath?: string
  uploadedChunks?: number[]
}

export interface MergeResult {
  filePath: string
  fileSize: number
}

export function checkFile(data: {
  fileHash: string
  fileName: string
  totalChunks: number
}): Promise<CheckFileResult> {
  return api.post('/upload/check', data).then(res => res.data as CheckFileResult)
}

export function uploadChunk(data: {
  chunk: Blob
  fileHash: string
  chunkIndex: number
  totalChunks: number
}): Promise<{ chunkIndex: number }> {
  const formData = new FormData()
  // 文本字段必须在文件字段之前，multer 才能在 destination 回调中读取
  formData.append('fileHash', data.fileHash)
  formData.append('chunkIndex', String(data.chunkIndex))
  formData.append('totalChunks', String(data.totalChunks))
  formData.append('chunk', data.chunk)
  return api.post('/upload/chunk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000
  }).then(res => res.data as { chunkIndex: number })
}

export function mergeChunks(data: {
  fileHash: string
  fileName: string
  totalChunks: number
}): Promise<MergeResult> {
  return api.post('/upload/merge', data).then(res => res.data as MergeResult)
}

export interface UploadedFile {
  fileName: string
  storedName: string
  fileHash: string
  fileSize: number
  uploadedAt: string
}

export function getUploadedFiles(): Promise<UploadedFile[]> {
  return api.get('/upload/files').then(res => res.data as UploadedFile[])
}

export function downloadFile(storedName: string): Promise<Blob> {
  return api.get(`/upload/download/${encodeURIComponent(storedName)}`, {
    responseType: 'blob'
  }).then(res => res.data as Blob)
}

export function deleteUploadedFile(storedName: string): Promise<void> {
  return api.delete(`/upload/files/${encodeURIComponent(storedName)}`).then(() => undefined)
}

export function calculateFileHash(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./hash-worker.ts', import.meta.url),
      { type: 'module' }
    )

    worker.onmessage = (e: MessageEvent<{ type: string; percent?: number; hash?: string }>) => {
      if (e.data.type === 'progress') {
        onProgress?.(e.data.percent!)
      } else if (e.data.type === 'done') {
        resolve(e.data.hash!)
        worker.terminate()
      }
    }

    worker.onerror = (err) => {
      reject(new Error(err.message || '哈希计算失败'))
      worker.terminate()
    }

    worker.postMessage(file)
  })
}

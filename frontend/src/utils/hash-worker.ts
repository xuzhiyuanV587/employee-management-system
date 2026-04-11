import SparkMD5 from 'spark-md5'

const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB

self.onmessage = async (e: MessageEvent<File>) => {
  const file = e.data
  const chunks = Math.ceil(file.size / CHUNK_SIZE)
  const spark = new SparkMD5.ArrayBuffer()

  for (let i = 0; i < chunks; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const buffer = await file.slice(start, end).arrayBuffer()
    spark.append(buffer)
    self.postMessage({ type: 'progress', percent: Math.floor(((i + 1) / chunks) * 100) })
  }

  self.postMessage({ type: 'done', hash: spark.end() })
}

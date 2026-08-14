import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const directory = path.resolve('public/assets')
const files = (await fs.readdir(directory)).filter((file) => file.endsWith('.jpg'))

await Promise.all(files.map(async (file) => {
  const source = path.join(directory, file)
  const destination = path.join(directory, file.replace(/\.jpg$/i, '.webp'))
  await sharp(source).webp({ quality: 74, effort: 5 }).toFile(destination)
}))

console.log(`Generated ${files.length} WebP images.`)

import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SPECS = [
  {
    url: 'https://callisto.allbox.work/specs/openapi.Jupiter.yaml',
    file: 'swagger.yaml',
  },
  {
    url: 'https://callisto.allbox.work/specs/openapi.Tyche.yaml',
    file: 'swagger-tyche.yaml',
  },
] as const

async function downloadSpec(dir: string, url: string, file: string) {
  console.log(`Downloading ${url}`)

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `Failed to download ${file}: ${response.status} ${response.statusText}`,
    )
  }

  const body = await response.text()
  const outPath = join(dir, file)
  await writeFile(outPath, body, 'utf8')

  console.log(`Wrote ${outPath} (${body.length.toLocaleString()} bytes)`)
}

async function main() {
  const dir = dirname(fileURLToPath(import.meta.url))

  for (const spec of SPECS) {
    await downloadSpec(dir, spec.url, spec.file)
  }
}

void main()

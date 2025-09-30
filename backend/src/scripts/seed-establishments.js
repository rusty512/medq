import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main() {
  const path = join(__dirname, '../../ramq-xml/parsed/specialist/establishments.json')
  const raw = readFileSync(path, 'utf-8')
  const items = JSON.parse(raw)

  let count = 0
  for (const item of items) {
    // RAMQ structure example:
    // {
    //  establishmentCode, establishmentName, establishmentCategory, establishmentType,
    //  regionCode, regionName, address, municipality, postalCode, isActive
    // }
    const code = String(item.establishmentCode || '').trim()
    const name = String(item.establishmentName || '').trim()
    if (!code || !name) continue
    const addressParts = [item.address, item.municipality, item.postalCode].filter(Boolean)
    const address = addressParts.join(', ')
    const category = item.establishmentCategory ? String(item.establishmentCategory) : null
    const establishment_type = item.establishmentType ? String(item.establishmentType) : null
    const region_code = item.regionCode ? String(item.regionCode) : null
    const region_name = item.regionName ? String(item.regionName) : null
    const municipality = item.municipality ? String(item.municipality) : null
    const postal_code = item.postalCode ? String(item.postalCode) : null
    const is_active = item.isActive !== false

    const codes = [code, establishment_type, region_name].filter(Boolean)

    await prisma.establishment.upsert({
      where: { code },
      create: { code, name, address, category, establishment_type, region_code, region_name, municipality, postal_code, is_active, codes },
      update: { name, address, category, establishment_type, region_code, region_name, municipality, postal_code, is_active, codes },
    })
    count++
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded ${count} establishments`)
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})



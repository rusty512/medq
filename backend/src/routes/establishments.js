import express from 'express'
import { prisma } from '../db.js'

const router = express.Router()

// GET /establishments?search=&limit=20
router.get('/establishments', async (req, res) => {
  try {
    const search = (req.query.search || '').toString().trim()
    const limit = Math.min(parseInt(req.query.limit || '100', 10), 500)
    const offset = Math.max(parseInt(req.query.offset || '0', 10), 0)

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
            { codes: { has: search } },
            { code: { contains: search, mode: 'insensitive' } },
            { region_name: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}

    const results = await prisma.establishment.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        address: true,
        category: true,
        establishment_type: true,
        region_code: true,
        region_name: true,
        municipality: true,
        postal_code: true,
        is_active: true,
        codes: true,
      },
    })

    return res.json(results)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch establishments' })
  }
})

export default router



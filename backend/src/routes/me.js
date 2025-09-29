import express from 'express'
import { prisma } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// GET /me - protected; upsert user on first access
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = req.supabaseUser
    const supabaseUid = user.id

    const firstName = user.user_metadata?.first_name || user.user_metadata?.firstName || null
    const lastName = user.user_metadata?.last_name || user.user_metadata?.lastName || null

    const dbUser = await prisma.user.upsert({
      where: { supabase_uid: supabaseUid },
      create: {
        supabase_uid: supabaseUid,
        first_name: firstName,
        last_name: lastName
      },
      update: {
        first_name: firstName ?? undefined,
        last_name: lastName ?? undefined
      }
    })

    return res.json({
      id: dbUser.id,
      supabase_uid: dbUser.supabase_uid,
      first_name: dbUser.first_name,
      last_name: dbUser.last_name,
      specialty: dbUser.specialty,
      default_establishment_id: dbUser.default_establishment_id,
      created_at: dbUser.created_at,
      updated_at: dbUser.updated_at
    })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user' })
  }
})

export default router



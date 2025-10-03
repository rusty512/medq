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
    
    console.log('GET /me - Supabase user metadata:', {
      user_metadata: user.user_metadata,
      firstName,
      lastName,
      email: user.email
    })

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

    console.log('GET /me - User data:', {
      id: dbUser.id,
      first_name: dbUser.first_name,
      last_name: dbUser.last_name,
      phone: dbUser.phone,
      professional_id: dbUser.professional_id,
      specialty_code: dbUser.specialty_code,
      specialty_name: dbUser.specialty_name
    })

    return res.json({
      id: dbUser.id,
      supabase_uid: dbUser.supabase_uid,
      first_name: dbUser.first_name,
      last_name: dbUser.last_name,
      phone: dbUser.phone,
      professional_id: dbUser.professional_id,
      specialty_code: dbUser.specialty_code,
      specialty_name: dbUser.specialty_name,
      default_establishment_id: dbUser.default_establishment_id,
      created_at: dbUser.created_at,
      updated_at: dbUser.updated_at
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('GET /me failed:', err)
    return res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// PUT /me - Update user profile data
router.put('/me', requireAuth, async (req, res) => {
  try {
    const user = req.supabaseUser
    const supabaseUid = user.id
    const { 
      firstName, 
      lastName, 
      professionalId, 
      specialtyCode, 
      specialtyName, 
      phone,
      establishments 
    } = req.body

    // Start a transaction to upsert user and update establishments safely
    const result = await prisma.$transaction(async (tx) => {
      // Ensure the user exists (create if missing)
      const baseUser = await tx.user.upsert({
        where: { supabase_uid: supabaseUid },
        create: {
          supabase_uid: supabaseUid,
          first_name: firstName || null,
          last_name: lastName || null,
          phone: phone || null,
        },
        update: {},
      })

      // Update user basic info
      const updatedUser = await tx.user.update({
        where: { id: baseUser.id },
        data: { 
          first_name: firstName,
          last_name: lastName,
          professional_id: professionalId,
          specialty_code: specialtyCode,
          specialty_name: specialtyName,
          phone: phone,
        }
      })

      // Handle establishments if provided
      if (establishments && establishments.length > 0) {
        // Remove existing user-establishment relationships
        await tx.userEstablishment.deleteMany({
          where: { user_id: updatedUser.id }
        })

        // Find establishments by their codes/names and create relationships
        const establishmentRelations = []
        let defaultEstablishmentId = null

        for (const establishmentData of establishments) {
          // Try to find establishment by code first, then by name
          let establishment = await tx.establishment.findFirst({
            where: {
              OR: [
                { code: establishmentData.id },
                { name: establishmentData.name }
              ]
            }
          })

          // If establishment doesn't exist, create it
          if (!establishment) {
            establishment = await tx.establishment.create({
              data: {
                code: establishmentData.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: establishmentData.name,
                address: establishmentData.address || '',
                codes: establishmentData.codes || [],
                category: establishmentData.type || '',
                establishment_type: establishmentData.type || ''
              }
            })
          }

          // Create user-establishment relationship
          const userEstablishment = await tx.userEstablishment.create({
            data: {
              user_id: updatedUser.id,
              establishment_id: establishment.id,
              is_default: establishmentData.isDefault || false
            }
          })

          establishmentRelations.push(userEstablishment)

          // Track default establishment
          if (establishmentData.isDefault) {
            defaultEstablishmentId = establishment.id
          }
        }

        // Update user's default establishment
        if (defaultEstablishmentId) {
          await tx.user.update({
            where: { id: updatedUser.id },
            data: { default_establishment_id: defaultEstablishmentId }
          })
        }
      }

      // Return updated user with establishments
      return await tx.user.findUnique({
        where: { id: updatedUser.id },
        include: {
          establishments: {
            include: {
              establishment: true
            }
          },
          default_establishment: true
        }
      })
    })

    return res.json({
      id: result.id,
      supabase_uid: result.supabase_uid,
      first_name: result.first_name,
      last_name: result.last_name,
      professional_id: result.professional_id,
      specialty_code: result.specialty_code,
      specialty_name: result.specialty_name,
      default_establishment_id: result.default_establishment_id,
      establishments: result.establishments?.map(ue => ({
        id: ue.establishment.id,
        name: ue.establishment.name,
        address: ue.establishment.address,
        code: ue.establishment.code,
        isDefault: ue.is_default
      })) || [],
      created_at: result.created_at,
      updated_at: result.updated_at
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('PUT /me failed:', err)
    return res.status(500).json({ error: 'Failed to update user' })
  }
})

export default router

// PUT /me/default-establishment
router.put('/me/default-establishment', requireAuth, async (req, res) => {
  try {
    const user = req.supabaseUser
    const supabaseUid = user.id
    const { establishmentId } = req.body || {}

    if (!establishmentId) {
      return res.status(400).json({ error: 'establishmentId is required' })
    }

    const updated = await prisma.user.update({
      where: { supabase_uid: supabaseUid },
      data: { default_establishment_id: establishmentId },
      select: { id: true, default_establishment_id: true }
    })

    return res.json(updated)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to set default establishment' })
  }
})



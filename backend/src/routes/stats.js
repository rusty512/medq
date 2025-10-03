import express from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// GET /stats/billing - protected; returns billing statistics
router.get('/stats/billing', requireAuth, async (req, res) => {
  try {
    // For now, return mock data since we don't have billing data in the database yet
    const mockStats = {
      today: {
        amount: 1250.50,
        count: 8,
        variation: 12.5
      },
      month: {
        amount: 18750.25,
        count: 125,
        variation: 8.3
      },
      refusal: {
        rate: 3.2,
        total: 125,
        refused: 4,
        approved: 121
      }
    }

    return res.json({
      success: true,
      data: mockStats
    })
  } catch (err) {
    console.error('GET /stats/billing failed:', err)
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch billing stats' 
    })
  }
})

export default router

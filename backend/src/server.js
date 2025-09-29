import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import { connectDatabase } from './db.js'
import meRouter from './routes/me.js'

const app = express()

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Health check (public)
app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

// Routes
app.use(meRouter)

const port = process.env.PORT || 4000

async function start() {
  try {
    await connectDatabase()
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on http://localhost:${port}`)
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()



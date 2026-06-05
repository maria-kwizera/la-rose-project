const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const DATA_FILE = path.join(__dirname, 'server-data.json')
const PORT = process.env.PORT || 3000

const loadData = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    return { users: [], sessions: {}, notes: {}, data: {} }
  }
}

const saveData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
}

const data = loadData()

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname)))

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token || !data.sessions[token]) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  req.user = data.sessions[token]
  next()
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }
  const user = data.users.find(x => x.username === username && x.password === password)
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }
  const token = uuidv4()
  data.sessions[token] = { username: user.username, role: user.role }
  saveData(data)
  return res.json({ token, username: user.username, role: user.role })
})

app.post('/api/logout', authenticate, (req, res) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')
  delete data.sessions[token]
  saveData(data)
  res.json({ message: 'Logged out' })
})

app.get('/api/validate', authenticate, (req, res) => {
  res.json({ user: req.user })
})

app.get('/api/notes', authenticate, (req, res) => {
  const page = req.query.page || 'index.html'
  res.json({ page, content: data.notes[page] || '' })
})

app.post('/api/notes', authenticate, (req, res) => {
  const { page, content } = req.body || {}
  if (!page) {
    return res.status(400).json({ message: 'Page is required' })
  }
  data.notes[page] = content || ''
  saveData(data)
  res.json({ page, content: data.notes[page] })
})

app.get('/api/data', authenticate, (req, res) => {
  const page = req.query.page || 'index.html'
  res.json({ page, data: data.data[page] || {} })
})

app.post('/api/data', authenticate, (req, res) => {
  const { page, content } = req.body || {}
  if (!page) {
    return res.status(400).json({ message: 'Page is required' })
  }
  data.data[page] = content || {}
  saveData(data)
  res.json({ page, data: data.data[page] })
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})

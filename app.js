const getApiBase = () => {
  if (typeof window === 'undefined') return ''
  if (window.location.protocol === 'file:') return 'http://localhost:3000'
  return ''
}

const API_BASE = getApiBase()
const TOKEN_KEY = 'auth.token'

const request = async (url, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`

  const config = { ...options, headers }
  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body)
  }

  try {
    const res = await fetch(`${API_BASE}${url}`, config)
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(body.message || 'Request failed')
    }
    return body
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to reach the server. Start the app with "npm start" and try again.')
    }
    throw error
  }
}

const redirect = (path) => {
  if (!location.pathname.endsWith(path)) {
    location.href = path
  }
}

const getCurrentPage = () => location.pathname.split('/').pop() || 'index.html'

const validateAuth = async () => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  try {
    const result = await request('/api/validate')
    return result.user || null
  } catch {
    localStorage.removeItem(TOKEN_KEY)
    return null
  }
}

const renderTopbarUser = (username) => {
  const topbarRight = document.querySelector('.topbar .right')
  if (!topbarRight) return

  topbarRight.textContent = `Signed in as ${username}`
  const logoutBtn = document.createElement('button')
  logoutBtn.className = 'logout-btn'
  logoutBtn.textContent = 'Logout'
  logoutBtn.addEventListener('click', async () => {
    try {
      await request('/api/logout', { method: 'POST' })
    } catch (_) {
      // ignore errors
    }
    localStorage.removeItem(TOKEN_KEY)
    redirect('login.html')
  })
  topbarRight.appendChild(logoutBtn)
}

const loadNotes = async (page) => {
  const result = await request(`/api/notes?page=${encodeURIComponent(page)}`)
  return result.content || ''
}

const saveNotes = async (page, content) => {
  await request('/api/notes', { method: 'POST', body: { page, content } })
}

const injectPageNotes = async () => {
  const grid = document.querySelector('.grid')
  if (!grid) return
  const page = getCurrentPage()
  const saved = await loadNotes(page)
  const card = document.createElement('article')
  card.className = 'card'
  card.innerHTML = `
    <h3>Page Notes</h3>
    <textarea class="page-notes" id="page-notes">${saved}</textarea>
    <button class="primary" id="page-notes-save">Save Notes</button>
  `
  grid.appendChild(card)
  const saveBtn = card.querySelector('#page-notes-save')
  saveBtn.addEventListener('click', async () => {
    const text = card.querySelector('#page-notes').value
    await saveNotes(page, text)
    alert('Notes saved to backend')
  })
}

const renderNav = () => {
  const path = getCurrentPage()
  document.querySelectorAll('.app-btn').forEach(a => {
    const href = a.getAttribute('href')
    if (href && href.endsWith(path)) a.classList.add('active')
  })
}

const initPageData = () => {
  const load = (key) => JSON.parse(localStorage.getItem(key) || '[]')
  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value))

  const initListPage = () => {
    const listEl = document.getElementById('inventory-list')
    const name = document.getElementById('inventory-name')
    const qty = document.getElementById('inventory-qty')
    const reorder = document.getElementById('inventory-reorder')
    const add = document.getElementById('inventory-add')
    const key = 'inventory.items'

    const render = () => {
      if (!listEl) return
      const items = load(key)
      listEl.innerHTML = ''
      items.forEach(it => {
        const d = document.createElement('div')
        d.className = 'list-item'
        d.innerHTML = `${it.name} — Qty: ${it.qty} <span class="ok">OK</span>`
        listEl.appendChild(d)
      })
    }
    if (load(key).length === 0) {
      save(key, [{ name: 'asdd', qty: 11587 }, { name: 'hhh', qty: 5324 }])
    }
    if (add) {
      add.addEventListener('click', () => {
        const n = name.value.trim()
        const q = Number(qty.value || 0)
        const r = Number(reorder.value || 0)
        if (!n) return alert('Enter item name')
        const items = load(key)
        items.push({ name: n, qty: q, reorder: r, created: Date.now() })
        save(key, items)
        name.value = ''
        qty.value = ''
        reorder.value = ''
        render()
      })
    }
    render()
  }

  const initPayrollPage = () => {
    const listEl = document.getElementById('payroll-list')
    const name = document.getElementById('payroll-name')
    const amount = document.getElementById('payroll-amount')
    const add = document.getElementById('payroll-add')
    const key = 'payroll.entries'
    const render = () => {
      if (!listEl) return
      const items = load(key)
      listEl.innerHTML = ''
      items.forEach(it => {
        const d = document.createElement('div')
        d.className = 'list-item'
        d.innerHTML = `${it.name} <div class="muted">USh ${it.amount.toLocaleString()}</div>`
        listEl.appendChild(d)
      })
    }
    if (add) {
      add.addEventListener('click', () => {
        const n = name.value.trim()
        const a = Number(amount.value || 0)
        if (!n) return alert('Enter staff name')
        const items = load(key)
        items.unshift({ name: n, amount: a, created: Date.now() })
        save(key, items)
        name.value = ''
        amount.value = ''
        render()
      })
    }
    render()
  }

  const initTruckPage = () => {
    const listEl = document.getElementById('truck-list')
    const route = document.getElementById('truck-route')
    const fuel = document.getElementById('truck-fuel')
    const add = document.getElementById('truck-add')
    const key = 'truck.trips'
    const render = () => {
      if (!listEl) return
      const items = load(key)
      listEl.innerHTML = ''
      items.forEach(it => {
        const d = document.createElement('div')
        d.className = 'list-item'
        d.textContent = `${it.route} — Fuel: ${it.fuel}`
        listEl.appendChild(d)
      })
    }
    if (add) {
      add.addEventListener('click', () => {
        const r = route.value.trim()
        const f = Number(fuel.value || 0)
        if (!r) return alert('Enter route')
        const items = load(key)
        items.unshift({ route: r, fuel: f, created: Date.now() })
        save(key, items)
        route.value = ''
        fuel.value = ''
        render()
      })
    }
    render()
  }

  const initPurchasesPage = () => {
    const listEl = document.getElementById('purchases-list')
    const supplier = document.getElementById('purchase-supplier')
    const add = document.getElementById('purchase-add')
    const key = 'purchases.orders'
    const render = () => {
      if (!listEl) return
      const items = load(key)
      listEl.innerHTML = ''
      items.forEach(it => {
        const d = document.createElement('div')
        d.className = 'list-item'
        d.innerHTML = `${it.supplier} <div class="muted">Total: USh ${it.total}</div>`
        listEl.appendChild(d)
      })
    }
    if (add) {
      add.addEventListener('click', () => {
        const s = supplier.value.trim() || 'Unknown'
        const items = load(key)
        items.unshift({ supplier: s, total: 0, created: Date.now() })
        save(key, items)
        supplier.value = ''
        render()
      })
    }
    render()
  }

  const initPosPage = () => {
    const tbody = document.getElementById('pos-order-body')
    const name = document.getElementById('pos-name')
    const qty = document.getElementById('pos-qty')
    const price = document.getElementById('pos-price')
    const add = document.getElementById('pos-add')
    const submit = document.getElementById('pos-submit')
    const totalEl = document.getElementById('pos-total')
    const key = 'pos.order'
    const render = () => {
      if (!tbody) return
      const items = load(key)
      tbody.innerHTML = ''
      let sum = 0
      items.forEach((it, i) => {
        const tr = document.createElement('tr')
        tr.innerHTML = `<td>${i+1}</td><td>${it.name}</td><td>${it.qty}</td><td>${it.price}</td>`
        tbody.appendChild(tr)
        sum += it.qty * it.price
      })
      if (totalEl) totalEl.textContent = `UGX ${sum.toLocaleString()}`
    }
    if (add) {
      add.addEventListener('click', () => {
        const n = name.value.trim()
        const q = Number(qty.value || 0)
        const p = Number(price.value || 0)
        if (!n) return alert('Enter item name')
        const items = load(key)
        items.push({ name: n, qty: q, price: p })
        save(key, items)
        name.value = ''
        qty.value = ''
        price.value = ''
        render()
      })
    }
    if (submit) {
      submit.addEventListener('click', () => {
        const items = load(key)
        if (items.length === 0) return alert('No items to submit')
        alert('Order submitted (demo)')
        save(key, [])
        render()
      })
    }
    render()
  }

  initListPage()
  initPayrollPage()
  initTruckPage()
  initPurchasesPage()
  initPosPage()
}

const initPage = async () => {
  const user = await validateAuth()
  if (!user) {
    redirect('login.html')
    return
  }
  renderTopbarUser(user.username)
  renderNav()
  await injectPageNotes()
  initPageData()

  document.querySelectorAll('.primary').forEach(btn => {
    if (!btn.id) btn.addEventListener('click', () => {
      alert('Action performed (demo)')
    })
  })
}

const initLoginPage = () => {
  const usernameInput = document.getElementById('login-username')
  const passwordInput = document.getElementById('login-password')
  const submitButton = document.getElementById('login-submit')
  const errorDisplay = document.getElementById('login-error')

  submitButton.addEventListener('click', async () => {
    errorDisplay.textContent = ''
    const username = usernameInput.value.trim()
    const password = passwordInput.value.trim()
    if (!username || !password) {
      errorDisplay.textContent = 'Username and password are required.'
      return
    }
    try {
      const body = await request('/api/login', {
        method: 'POST',
        body: { username, password }
      })
      localStorage.setItem(TOKEN_KEY, body.token)
      redirect('index.html')
    } catch (err) {
      errorDisplay.textContent = err.message
    }
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  const currentPage = getCurrentPage()
  const isLoginPage = currentPage === 'login.html'

  if (isLoginPage) {
    const user = await validateAuth()
    if (user) {
      redirect('index.html')
      return
    }
    initLoginPage()
    return
  }

  const user = await validateAuth()
  if (!user) {
    redirect('login.html')
    return
  }
  initPage()
})

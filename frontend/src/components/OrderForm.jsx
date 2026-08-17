import { useState } from 'react'
import { createOrder } from '../api'

const emptyItem = () => ({ productName: '', quantity: 1, unitPrice: '' })

export default function OrderForm({ token, onOrderCreated }) {
  const [customerName, setCustomerName] = useState('')
  const [items, setItems] = useState([emptyItem()])
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function updateItem(index, field, value) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)))
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()])
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!customerName.trim() || items.length === 0) {
      setError('Add a customer name and at least one item.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        customerName,
        items: items.map((it) => ({
          productName: it.productName,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice)
        }))
      }
      const order = await createOrder(token, payload)
      onOrderCreated(order)
      setCustomerName('')
      setItems([emptyItem()])
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="glass">
      <div className="section-label">create order</div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="customerName">customer name</label>
        <input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nick Ng" />

        {items.map((item, index) => (
          <div className="item-row" key={index}>
            <input
              placeholder="Product"
              value={item.productName}
              onChange={(e) => updateItem(index, 'productName', e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <input
              type="number"
              min="1"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => updateItem(index, 'quantity', e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={item.unitPrice}
              onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <button type="button" className="btn-ghost" onClick={() => removeItem(index)} disabled={items.length === 1}>
              ✕
            </button>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button type="button" className="btn-ghost" onClick={addItem}>+ add item</button>
        </div>

        {error && <div className="error-text" style={{ marginTop: 14 }}>{error}</div>}

        <button className="btn-primary" type="submit" disabled={submitting} style={{ marginTop: 18 }}>
          {submitting ? 'creating…' : 'create order →'}
        </button>
      </form>
    </div>
  )
}

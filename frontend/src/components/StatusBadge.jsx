export default function StatusBadge({ status }) {
  const label = status.toLowerCase()
  return (
    <div className={`status ${label}`}>
      <span className={`dot ${label}`}></span>
      {label}
    </div>
  )
}

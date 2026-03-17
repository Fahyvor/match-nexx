
const ProtectedRoute = ({ role }) => {
  // Implementation for protected route logic
  if (!role) {
    return <div>Please log in to access this route.</div>;
  }

  return (
    <div>ProtectedRoute</div>
  )
}

export default ProtectedRoute
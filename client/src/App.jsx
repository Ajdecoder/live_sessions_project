import React from 'react'
import { Link } from 'react-router-dom'
import Admin from './components/Admin'

export default function App(){
  return (
    <div>
      {/* <Link to="/admin">
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Go to Admin</button>
      </Link> */}
      <Admin/>
    </div>
  )
}
import React from 'react'
import Login from './pages/Login'
import Squares from './components/Squares'

const App = () => {
  return (
    <div className='bg-black h-screen relative overflow-hidden'>
        <Squares />

        <div className='text-white absolute inset-0 flex justify-center items-center'>
          <Login/>
        </div>
    </div>
  )
}

export default App

import React from 'react'
import ReactDOM from 'react-dom/client'
import VisualCapture from './components/VisualCapture'
import './index.css'

ReactDOM.createRoot(document.getElementById('capture-root')!).render(
  <React.StrictMode>
    <VisualCapture />
  </React.StrictMode>,
)
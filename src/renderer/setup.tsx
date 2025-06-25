import React from 'react'
import ReactDOM from 'react-dom/client'
import SetupWizard from './components/SetupWizard'
import './index.css'

ReactDOM.createRoot(document.getElementById('setup-root')!).render(
  <React.StrictMode>
    <SetupWizard />
  </React.StrictMode>,
)
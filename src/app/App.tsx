import { Routes, Route, Navigate } from 'react-router-dom'
import { WelcomeScreen } from '@/components/welcome/WelcomeScreen'
import { BirdListPlaceholder } from '@/components/birds/BirdListPlaceholder'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomeScreen />} />
      <Route path="/birds" element={<BirdListPlaceholder />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

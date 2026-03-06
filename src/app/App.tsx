import { Routes, Route, Navigate } from 'react-router-dom'
import { HomeScreen } from '@/components/home/HomeScreen'
import { BirdListPlaceholder } from '@/components/birds/BirdListPlaceholder'

export default function App() {
  return (
    <div className="h-full">
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/birds" element={<BirdListPlaceholder />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

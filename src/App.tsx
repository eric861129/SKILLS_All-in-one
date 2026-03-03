import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SkillPage } from './pages/SkillPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/skill/:id" element={<SkillPage />} />
    </Routes>
  )
}

export default App

import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SkillPage } from './pages/SkillPage';
import { AuthorPage } from './pages/AuthorPage';
import { DocsPage } from './pages/DocsPage';
import { CommandPalette } from './components/CommandPalette';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/skill/:id" element={<SkillPage />} />
        <Route path="/author/:name" element={<AuthorPage />} />
        <Route path="/docs/:slug?" element={<DocsPage />} />
      </Routes>
      <CommandPalette />
    </>
  )
}

export default App

import { useState } from 'react';
import './App.css';
import ProjectsList from './components/ProjectsList';
import ProjectDetails from './components/ProjectDetails';

type FontSize = 'small' | 'medium' | 'large';

function App() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState<FontSize>('medium');

  const handleProjectSelect = (projectId: number) => {
    setSelectedProjectId(projectId);
  };

  const handleBack = () => {
    setSelectedProjectId(null);
  };

  return (
    <div className={`app font-size-${fontSize}`}>
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>🎬 Système de Gestion UGC Cinema</h1>
          <div className="font-controls">
            <label htmlFor="font-size">📝 Taille de police:</label>
            <select
              id="font-size"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as FontSize)}
            >
              <option value="small" className='text-sm text-black' >🔍 Petite</option>
              <option value="medium" className='text-base text-black'>📖 Moyenne</option>
              <option value="large" className='text-lg text-black'>🔍 Grande</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {selectedProjectId ? (
          <ProjectDetails 
            projectId={selectedProjectId} 
            onBack={handleBack} 
          />
        ) : (
          <ProjectsList onProjectSelect={handleProjectSelect} />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>💻 Système de Gestion UGC Cinema - Entretien Technique</p>
        <p>🚀 React TypeScript + FastAPI Python | 📊 Interface moderne et responsive</p>
      </footer>
    </div>
  );
}

export default App;

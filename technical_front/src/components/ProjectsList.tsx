import React, { useState, useEffect } from 'react';
import type { Project } from '../services/api';
import { projectsApi } from '../services/api';

interface ProjectsListProps {
  onProjectSelect: (projectId: number) => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({ onProjectSelect }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // === ENHANCED SORTING FUNCTIONALITY ===
  // Added support for sorting by update date for better project management
  const [sortBy, setSortBy] = useState<'name' | 'create_on' | 'update_on'>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [filterEnabled, setFilterEnabled] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadProjects();
  }, [sortBy, order]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getProjects(sortBy, order);
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des projets');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProject = async (projectId: number) => {
    try {
      await projectsApi.toggleProject(projectId);
      await loadProjects(); // Reload to get updated status
    } catch (err) {
      setError('Erreur lors de la modification du projet');
      console.error('Error toggling project:', err);
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filterEnabled === 'active') return project.enabled;
    if (filterEnabled === 'inactive') return !project.enabled;
    return true;
  });

  // === ENHANCED SORT TOGGLE FUNCTION ===
  // Professional sorting with support for all date fields
  const toggleSort = (newSortBy: 'name' | 'create_on' | 'update_on') => {
    if (sortBy === newSortBy) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setOrder('asc');
    }
  };

  if (loading) return <div className="loading">Chargement des projets...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="projects-list">
      <h1>🎬 Gestion des Projets UGC</h1>
      
      {/* Controls */}
      <div className="controls">
        <div className="controls-row">
          <div className="filters">
            <label>
              📊 Filtrer par statut:
              <select 
                value={filterEnabled} 
                onChange={(e) => setFilterEnabled(e.target.value as any)}
              >
                <option value="all">🔍 Tous les projets</option>
                <option value="active">✅ Actifs seulement</option>
                <option value="inactive">❌ Inactifs seulement</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="table-container">
        <table className="projects-table">
          <thead>
            <tr>
              <th 
                onClick={() => toggleSort('name')}
                className={sortBy === 'name' ? `sortable active ${order}` : 'sortable'}
              >
                🏢 Nom du Projet {sortBy === 'name' && (order === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => toggleSort('create_on')}
                className={sortBy === 'create_on' ? `sortable active ${order}` : 'sortable'}
              >
                📅 Date de Création {sortBy === 'create_on' && (order === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => toggleSort('update_on')}
                className={sortBy === 'update_on' ? `sortable active ${order}` : 'sortable'}
              >
                🔄 Date de MAJ {sortBy === 'update_on' && (order === 'asc' ? '↑' : '↓')}
              </th>
              <th>📊 Statut</th>
              <th>⚡ Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map(project => (
              <tr key={project.id} className={project.enabled ? 'enabled' : 'disabled'}>
                <td className="project-name" data-label="Nom du Projet">
                  {project.name}
                </td>
                <td data-label="Date de Création">
                  {new Date(project.create_on).toLocaleDateString('fr-FR')}
                </td>
                <td data-label="Date de MAJ">
                  {new Date(project.update_on).toLocaleDateString('fr-FR')}
                </td>
                <td data-label="Statut">
                  <span className={`status ${project.enabled ? 'active' : 'inactive'}`}>
                    {project.enabled ? '✅ Actif' : '❌ Inactif'}
                  </span>
                </td>
                <td className="actions" data-label="Actions">
                  <button
                    onClick={() => handleToggleProject(project.id)}
                    className={`toggle-btn ${project.enabled ? 'disable' : 'enable'}`}
                  >
                    {project.enabled ? '🔴 Désactiver' : '🟢 Activer'}
                  </button>
                  {project.enabled && (
                    <button
                      onClick={() => onProjectSelect(project.id)}
                      className="view-btn"
                    >
                      📊 Voir Détails
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="summary">
        <p>
          📈 <strong>{filteredProjects.filter(p => p.enabled).length}</strong> projets actifs | 
          📉 <strong>{filteredProjects.filter(p => !p.enabled).length}</strong> projets inactifs | 
          📊 <strong>{filteredProjects.length}</strong> total affiché
        </p>
      </div>
    </div>
  );
};

export default ProjectsList; 
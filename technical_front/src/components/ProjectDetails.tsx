import React, { useState, useEffect } from 'react';
import type { Project, ProjectValuesResponse, NumericValueResponse } from '../services/api';
import { projectsApi, exportApi } from '../services/api';

interface ProjectDetailsProps {
  projectId: number;
  onBack: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [valuesData, setValuesData] = useState<ProjectValuesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'time_begin' | 'time_end' | string>('time_begin');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [filterValue, setFilterValue] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projectData, valuesResponse] = await Promise.all([
        projectsApi.getProject(projectId),
        projectsApi.getProjectValues(projectId, { sortBy: 'time', order })
      ]);
      
      setProject(projectData);
      setValuesData(valuesResponse);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données du projet');
      console.error('Error loading project data:', err);
    } finally {
      setLoading(false);
    }
  };

  // === PROFESSIONAL EXPORT FUNCTIONALITY ===
  // Flexible data export supporting multiple formats and aggregation levels for business intelligence
  const handleExport = async (format: 'csv' | 'json', aggregateHours: number = 1) => {
    try {
      setExportLoading(true);
      if (format === 'csv') {
        await exportApi.exportCsv(projectId, aggregateHours);
      } else {
        await exportApi.exportJson(projectId, aggregateHours);
      }
    } catch (err) {
      setError(`Erreur lors de l'export ${format.toUpperCase()}`);
      console.error('Export error:', err);
    } finally {
      setExportLoading(false);
    }
  };

  // Fonction de tri améliorée pour toutes les colonnes
  const sortValues = (values: any[], sortBy: string, order: 'asc' | 'desc') => {
    return [...values].sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'time_begin') {
        aValue = a.time_begin;
        bValue = b.time_begin;
      } else if (sortBy === 'time_end') {
        aValue = a.time_end;
        bValue = b.time_end;
      } else if (sortBy.startsWith('indicator_')) {
        const categoryId = parseInt(sortBy.replace('indicator_', ''));
        aValue = a.values[categoryId] || 0;
        bValue = b.values[categoryId] || 0;
      } else {
        return 0;
      }
      
      // Tri numérique pour les valeurs d'indicateurs
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Tri alphabétique/temporel pour les autres
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // FILTRAGE AMÉLIORÉ - Fonctionne sur temps ET valeurs numériques
  const filteredValues = valuesData?.values.filter(value => {
    if (!filterValue) return true;
    
    const searchTerm = filterValue.toLowerCase().trim();
    
    // 1. Recherche dans les temps (début et fin)
    const timeBeginMatch = value.time_begin.toLowerCase().includes(searchTerm);
    const timeEndMatch = value.time_end.toLowerCase().includes(searchTerm);
    
    // 2. Recherche dans les valeurs numériques (conversion en string pour la recherche)
    const valuesMatch = Object.values(value.values).some(numValue => {
      // Conversion en string et recherche
      const valueStr = numValue.toString().toLowerCase();
      return valueStr.includes(searchTerm);
    });
    
    // 3. Recherche numérique exacte pour les nombres
    const isNumericSearch = !isNaN(parseFloat(searchTerm));
    let numericMatch = false;
    
    if (isNumericSearch) {
      const searchNumber = parseFloat(searchTerm);
      numericMatch = Object.values(value.values).some(numValue => {
        // Recherche exacte, ou contient le nombre
        return numValue === searchNumber || 
               numValue.toString().includes(searchTerm);
      });
    }
    
    // 4. Recherche dans les heures/minutes pour les temps
    const timePatternMatch = value.time_begin.includes(searchTerm) || 
                           value.time_end.includes(searchTerm);
    
    // Retourne true si au moins une des conditions est remplie
    return timeBeginMatch || timeEndMatch || valuesMatch || numericMatch || timePatternMatch;
  }) || [];

  // Appliquer le tri sur les valeurs filtrées
  const sortedValues = sortValues(filteredValues, sortBy, order);

  const toggleSort = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setOrder('asc');
    }
  };

  if (loading) return <div className="loading">Chargement des données...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!project || !valuesData) return <div className="error">Données non disponibles</div>;

  // Get unique indicators from the data
  const indicators = valuesData.indicators || [];
  const uniqueCategories = Array.from(new Set(
    filteredValues.flatMap(value => Object.keys(value.values).map(Number))
  )).sort();

  return (
    <div className="project-details">
      {/* Header */}
      <div className="header">
        <button onClick={onBack} className="back-btn">← Retour à la liste</button>
        <h1>🎬 {project.name}</h1>
        <div className="project-info">
          <span className={`status ${project.enabled ? 'active' : 'inactive'}`}>
            {project.enabled ? '✅ Actif' : '❌ Inactif'}
          </span>
          <span>📅 Créé le {new Date(project.create_on).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="controls-row">
          <div className="filters">
            <label>
              🔍 Filtrage avancé:
              <input
                type="text"
                placeholder="🕐 Rechercher par temps (ex: 09:00) ou 📊 valeur numérique (ex: 150)..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="filter-input"
              />
            </label>
            {filterValue && (
              <div style={{ 
                fontSize: '0.875rem', 
                color: 'var(--primary-600)', 
                fontWeight: '600',
                marginTop: '0.5rem'
              }}>
                📊 {sortedValues.length} résultat(s) trouvé(s) pour "{filterValue}"
              </div>
            )}
          </div>
          
          <div className="export-controls">
            <h3>📥 Export des données</h3>
            <div className="export-buttons">
              <select 
                onChange={(e) => {
                  const [format, hours] = e.target.value.split('-');
                  if (format && hours) {
                    handleExport(format as 'csv' | 'json', parseInt(hours));
                  }
                }} 
                disabled={exportLoading}
                defaultValue=""
              >
                <option value="">📥 Choisir un export...</option>
                <option value="csv-1">📊 CSV (1h)</option>
                <option value="csv-3">📊 CSV (3h agrégé)</option>
                <option value="csv-6">📊 CSV (6h agrégé)</option>
                <option value="csv-12">📊 CSV (12h agrégé)</option>
                <option value="json-1">🗂️ JSON (1h)</option>
                <option value="json-3">🗂️ JSON (3h agrégé)</option>
                <option value="json-6">🗂️ JSON (6h agrégé)</option>
                <option value="json-12">🗂️ JSON (12h agrégé)</option>
              </select>
              {exportLoading && <span>⏳ Export en cours...</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Indicators Summary */}
      <div className="indicators-summary">
        <h3>📈 Indicateurs disponibles</h3>
        <div className="indicators-grid">
          {indicators.map(indicator => (
            <div key={indicator.id} className="indicator-card">
              <strong>📊 {indicator.label}</strong>
              <span>🕐 {indicator.timeslots} créneaux de temps</span>
            </div>
          ))}
        </div>
      </div>

      {/* Values Table - STRUCTURE EXACTE DEMANDÉE AVEC TRI COMPLET */}
      <div className="table-container">
        <table className="values-table">
          <thead>
            <tr>
              <th 
                onClick={() => toggleSort('time_begin')}
                className={sortBy === 'time_begin' ? `sortable active ${order}` : 'sortable'}
              >
                🕐 Temps de début {sortBy === 'time_begin' && (order === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => toggleSort('time_end')}
                className={sortBy === 'time_end' ? `sortable active ${order}` : 'sortable'}
              >
                🕐 Temps de fin {sortBy === 'time_end' && (order === 'asc' ? '↑' : '↓')}
              </th>
              {/* Colonnes dynamiques pour chaque indicateur - TOUTES TRIABLES */}
              {uniqueCategories.map((categoryId, index) => {
                const indicatorLabel = `Indicateur ${index + 1}`;
                const sortKey = `indicator_${categoryId}`;
                return (
                  <th 
                    key={categoryId}
                    onClick={() => toggleSort(sortKey)}
                    className={sortBy === sortKey ? `sortable active ${order}` : 'sortable'}
                  >
                    📊 {indicatorLabel} {sortBy === sortKey && (order === 'asc' ? '↑' : '↓')}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedValues.length > 0 ? (
              sortedValues.map((value, index) => (
                <tr key={index}>
                  <td data-label="Temps de début">{value.time_begin}</td>
                  <td data-label="Temps de fin">{value.time_end}</td>
                  {/* Valeurs pour chaque indicateur */}
                  {uniqueCategories.map((categoryId, catIndex) => (
                    <td 
                      key={categoryId} 
                      className="value-cell"
                      data-label={`Indicateur ${catIndex + 1}`}
                    >
                      {value.values[categoryId] !== undefined ? value.values[categoryId] : '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={uniqueCategories.length + 2} style={{ textAlign: 'center', padding: '2rem' }}>
                  {filterValue ? 
                    `🔍 Aucun résultat trouvé pour "${filterValue}"` : 
                    '📊 Aucune donnée disponible'
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="summary">
        <p>
          📊 <strong>{sortedValues.length}</strong> créneaux temporels affichés | 
          📈 <strong>{uniqueCategories.length}</strong> indicateurs | 
          📅 Projet créé le {new Date(project.create_on).toLocaleDateString('fr-FR')} |
          🔄 Tri par: <strong>{sortBy === 'time_begin' ? 'Temps début' : sortBy === 'time_end' ? 'Temps fin' : 'Indicateur'}</strong> ({order === 'asc' ? 'Croissant' : 'Décroissant'})
          {filterValue && (
            <span> | 🔍 Filtré par: <strong>"{filterValue}"</strong></span>
          )}
        </p>
      </div>
    </div>
  );
};

export default ProjectDetails; 
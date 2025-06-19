import React, { useEffect, useState } from 'react';
import { fetchProjects } from "../service/ProjectService.ts";
import { Search, Calendar, Type, ChevronDown } from 'lucide-react';


export interface Project {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
}


const ProjectList: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'created_at'>('name');
    const [sortAsc, setSortAsc] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        fetchProjects()
            .then(data => {
                setProjects(data);
                setFilteredProjects(data);
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        let filtered = projects.filter(project =>
            project.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filtered = filtered.sort((a, b) => {
            const fieldA = a[sortBy];
            const fieldB = b[sortBy];
            if (fieldA < fieldB) return sortAsc ? -1 : 1;
            if (fieldA > fieldB) return sortAsc ? 1 : -1;
            return 0;
        });

        setFilteredProjects(filtered);
    }, [projects, searchTerm, sortBy, sortAsc]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleSortChange = (field: 'name' | 'created_at') => {
        if (sortBy === field) {
            setSortAsc(!sortAsc);
        } else {
            setSortBy(field);
            setSortAsc(true);
        }
        setIsDropdownOpen(false);
    };

    const getSortLabel = () => {
        const direction = sortAsc ? '↑' : '↓';
        return sortBy === 'name' ? `Nom ${direction}` : `Date ${direction}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Projets
                    </h1>
                    <p className="text-gray-600">
                        Gérez et explorez vos projets en cours
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Rechercher un projet..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors duration-200 font-medium text-gray-700"
                            >
                                {sortBy === 'name' ? <Type className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                                {getSortLabel()}
                                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                                    <button
                                        onClick={() => handleSortChange('name')}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Type className="w-4 h-4" />
                                        Trier par nom
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map(project => (
                        <div
                            key={project.id}
                            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer group"
                        >
                            <div className="flex flex-col h-full">
                                <div className="flex-1 mb-4">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {project.name}
                                    </h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 flex items-center justify-center">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                            </div>
                                            <span>Modifié le {formatDate(project.updated_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Projet #{project.id}
                                        </span>
                                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProjects.length === 0 && (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
                        <p className="text-gray-600">
                            Essayez de modifier votre recherche ou vos filtres
                        </p>
                    </div>
                )}

                {filteredProjects.length > 0 && (
                    <div className="mt-8 text-center text-gray-600">
                        {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''} affiché{filteredProjects.length > 1 ? 's' : ''}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectList;
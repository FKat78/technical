import type {Project} from "../pages/ProjectsList.tsx";

const apiUrl = "http://localhost:8000"

export const fetchProjects = async (): Promise<Project[]> => {
    const response = await fetch(`${apiUrl}/projects/all?token=entropy`);
    if (!response.ok) {
        throw new Error('Failed to fetch projects');
    }
    return await response.json();
};
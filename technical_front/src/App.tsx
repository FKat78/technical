// App.tsx
import { Routes, Route } from "react-router-dom";
import ProjectList from "./features/projects/pages/ProjectsList.tsx";

function App() {
	return (
		<Routes>
			<Route path="/" element={<ProjectList />} />
		</Routes>
	);
}

export default App;

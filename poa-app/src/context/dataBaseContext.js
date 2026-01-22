import { createContext, useContext, useState, useEffect } from 'react';
import { useProjectContext } from './ProjectContext';
import { useRouter } from 'next/router';




const DataBaseContext = createContext();

export const useDataBaseContext = () => {
  return useContext(DataBaseContext);
};

export const DataBaseProvider = ({ children }) => {
    // usestate for projects initalized with mock data with 3 projects and each has an id 

    const router = useRouter();
    const { userDAO } = router.query;

    const {projectsData}= useProjectContext();


    useEffect(()=>{
        if (typeof projectsData === 'object' && projectsData !== null && Object.keys(projectsData).length !== 0) {
            console.log("projectsData", projectsData);
            setProjects(projectsData);

            // Only set selectedProject if:
            // 1. No project is currently selected, OR
            // 2. The currently selected project is no longer in the list
            // This preserves the user's selection when data is refreshed
            setSelectedProject(prev => {
                // If we have a selection and it still exists in the new data, update it with fresh data
                if (prev && prev.id) {
                    const updatedProject = projectsData.find(p => p.id === prev.id);
                    if (updatedProject) {
                        return updatedProject;
                    }
                }
                // Otherwise default to first project
                return projectsData[0];
            });
        }
    },[projectsData])


    // Projects are populated from ProjectContext via useEffect
    const [projects, setProjects] = useState([]);


    function setSelectedProjectId(projectId){

      const project = projects.find(project => project.id === projectId);
      setSelectedProject(project);
    }

    const [selectedProject,setSelectedProject] = useState('')

    // Placeholder function - username lookup should use subgraph data
    const getUsernameByAddress = async (address) => {
      // In POP, usernames are stored in the subgraph via UniversalAccountRegistry
      // For now, return a truncated address as fallback
      if (!address) return 'Unknown';
      return `${address.substring(0, 6)}...${address.substring(38)}`;
    };

    // Handle column updates from TaskBoard
    const handleUpdateColumns = (newColumns) => {
      if (selectedProject) {
        const updatedProject = { ...selectedProject, columns: newColumns };
        setSelectedProject(updatedProject);

        // Update in projects array too
        setProjects(prev => prev.map(p =>
          p.id === selectedProject.id ? updatedProject : p
        ));
      }
    };

    return (
        <DataBaseContext.Provider
        value={{
          projects,
          setSelectedProjectId,
          selectedProject,
          setSelectedProject,
          handleUpdateColumns,
          getUsernameByAddress,
        }}
        >
        {children}
        </DataBaseContext.Provider>

      );
    };
import axios from "axios";
import { useEffect, useState } from "react";
import api from "../../services/api";


import SectionTitle from "../../components/SectionTitle";
import Breadcrumbs from "../../components/Breadcrumbs";
import StatusBadge from "../../components/StatusBadge";
import SearchHighlight from "../../components/SearchHighlight";
import LoadingSkeleton from "../../components/LoadingSkeleton";
function ProjectsPage({

  showProjectForm,
  setShowProjectForm,
  projectSearch,
  setProjectSearch,
  newProject,
  setNewProject,
  projects,
  setProjects,
  filteredProjects,
  setSelectedProject,
  navigate,
  editingProject,
  setEditingProject,
  showDeleteConfirm,
  setShowDeleteConfirm,
  projectToDelete,
  setProjectToDelete,
  darkMode,
  projectSort,
  setProjectSort,
  clearProjectFilters,
  showToast,
  favoriteProjects,
  setFavoriteProjects,
  isLoading,
  addRecentItem,
  addNotification,
}) {

  const [apiData, setApiData] = useState([]);

  useEffect(() => {
    api
      .get('/projects')
      .then((response) => {
        console.log(response.data);
        setApiData(response.data);
        setProjects(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  const cardBg = darkMode ? "bg-[#111827] border-gray-700" : "bg-white border-gray-200";
  const textMain = darkMode ? "text-white" : "text-gray-900";
  const textSub = darkMode ? "text-gray-300" : "text-gray-500";
  const inputBg = darkMode
    ? "bg-[#0F172A] border-gray-700 text-white placeholder:text-gray-400"
    : "bg-white border-gray-200 text-gray-900";

  const getProjectStatus = (project) => {
    if (project.reports >= 4) return { label: "Active", variant: "default" };
    if (project.reports >= 2) return { label: "In Progress", variant: "warning" };
    return { label: "New", variant: "dark" };
  };

  const getProjectProgress = (reports) => {
    const max = 5;
    return Math.min((reports / max) * 100, 100);
  };

  const isFavorite = (projectId) => favoriteProjects.includes(projectId);

  const toggleFavorite = (projectId) => {
    if (favoriteProjects.includes(projectId)) {
      setFavoriteProjects((prev) => prev.filter((id) => id !== projectId));
      showToast("success", "Removed from favorites", "Project removed from favorites.");
    } else {
      setFavoriteProjects((prev) => [...prev, projectId]);
      showToast("success", "Added to favorites", "Project marked as favorite.");
    }
  };

 const handleSubmitProject = () => {
  if (!newProject.name || !newProject.type || !newProject.country) {
    showToast("error", "Missing fields", "Please fill all fields.");
    return;
  }

  if (editingProject) {
    api
      .put(`/projects/${editingProject.id}`, {
        name: newProject.name,
        type: newProject.type,
        country: newProject.country,
      })
      .then((response) => {
        const updatedProject = response.data.project;

        setProjects((prev) =>
          prev.map((project) =>
            project.id === updatedProject.id ? updatedProject : project
          )
        );

        showToast("success", "Project updated", `${newProject.name} was updated successfully.`);
        addNotification("Project updated", `${newProject.name} details were updated.`);

        setNewProject({ name: "", type: "", country: "" });
        setEditingProject(null);
        setShowProjectForm(false);
      })
      .catch((error) => {
        console.log(error);
        showToast("error", "Error", "Project was not updated.");
      });

    return;
  }

  api
    .post('/projects', {
      name: newProject.name,
      type: newProject.type,
      country: newProject.country,
      reports: 0,
    })
    .then((response) => {
      const createdProject = response.data.project;

      setProjects((prev) => [...prev, createdProject]);

      showToast("success", "Project created", `${newProject.name} was created successfully.`);
      addNotification("Project created", `${newProject.name} was added to your workspace.`);

      setNewProject({ name: "", type: "", country: "" });
      setEditingProject(null);
      setShowProjectForm(false);
    })
    .catch((error) => {
      console.log(error);
      showToast("error", "Error", "Project was not saved.");
    });
};


  const startEditProject = (project) => {
    setEditingProject(project);
    setNewProject({
      name: project.name,
      type: project.type,
      country: project.country,
    });
    setShowProjectForm(true);
  };

  const confirmDeleteProject = (project) => {
    setProjectToDelete(project);
    setShowDeleteConfirm(true);
  };

  const handleDeleteProject = () => {
  if (!projectToDelete) return;

  api
    .delete(`/projects/${projectToDelete.id}`)
    .then(() => {
      const deletedName = projectToDelete.name;

      setProjects((prev) =>
        prev.filter((project) => project.id !== projectToDelete.id)
      );

      setShowDeleteConfirm(false);
      setProjectToDelete(null);

      showToast(
        "success",
        "Project deleted",
        `${deletedName} was deleted.`
      );

      addNotification(
        "Project deleted",
        `${deletedName} was removed from projects.`
      );
    })
    .catch((error) => {
      console.log(error);

      showToast(
        "error",
        "Error",
        "Project was not deleted."
      );
    });
};

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showProjectForm && !showDeleteConfirm) return;

      if (e.key === "Escape") {
        setShowProjectForm(false);
        setShowDeleteConfirm(false);
        setEditingProject(null);
      }

      if (e.key === "Enter" && showProjectForm) {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag !== "button") handleSubmitProject();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <>
      <Breadcrumbs items={["Dashboard", "Projects"]} darkMode={darkMode} />

      <SectionTitle
        title="Projects"
        subtitle="All your projects with reports and latest activity"
        darkMode={darkMode}
        action={
          <button
            onClick={() => {
              setEditingProject(null);
              setNewProject({ name: "", type: "", country: "" });
              setShowProjectForm(true);
            }}
            className="bg-[#355872] hover:bg-[#7AAACE] text-white px-5 py-3 rounded-xl shadow-sm transition hover:scale-[1.02]"
          >
            + New Project
          </button>
        }
      />

      <div className={`border rounded-2xl p-4 mb-6 shadow-sm ${cardBg}`}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_140px] gap-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            <input
              type="text"
              placeholder="Search projects by name..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className={`w-full rounded-xl border pl-12 pr-4 py-3 outline-none transition focus:border-[#355872] focus:ring-2 focus:ring-[#355872] ${inputBg}`}
            />
          </div>

          <select
            value={projectSort}
            onChange={(e) => setProjectSort(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-[#355872] ${inputBg}`}
          >
            <option value="name-asc">Sort: Name A-Z</option>
            <option value="name-desc">Sort: Name Z-A</option>
            <option value="reports-desc">Sort: Reports High-Low</option>
            <option value="reports-asc">Sort: Reports Low-High</option>
          </select>

          <button
            onClick={clearProjectFilters}
            className={`rounded-xl border px-4 py-3 transition ${
              darkMode
                ? "border-gray-600 text-gray-100 hover:bg-gray-800"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Clear
          </button>
        </div>
      </div>

      {showProjectForm && (
        <div className={`border rounded-2xl p-6 mb-6 shadow-sm ${cardBg}`}>
          <h3 className={`text-lg font-semibold mb-4 ${textMain}`}>
            {editingProject ? "Edit Project" : "Create New Project"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Project Name"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className={`border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#355872] ${inputBg}`}
            />

            <input
              type="text"
              placeholder="Type"
              value={newProject.type}
              onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
              className={`border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#355872] ${inputBg}`}
            />

            <input
              type="text"
              placeholder="Country"
              value={newProject.country}
              onChange={(e) => setNewProject({ ...newProject, country: e.target.value })}
              className={`border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#355872] ${inputBg}`}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmitProject}
              className="bg-[#355872] text-white px-4 py-2 rounded-xl hover:bg-[#7AAACE] transition"
            >
              {editingProject ? "Save Changes" : "Create"}
            </button>

            <button
              onClick={() => {
                setShowProjectForm(false);
                setEditingProject(null);
                setNewProject({ name: "", type: "", country: "" });
              }}
              className={`border px-4 py-2 rounded-xl transition ${
                darkMode
                  ? "border-gray-600 text-gray-200 hover:bg-gray-800"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSkeleton darkMode={darkMode} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const status = getProjectStatus(project);
            const progress = getProjectProgress(project.reports);

            return (
              <div
                key={project.id}
                className={`border rounded-2xl p-6 shadow-sm hover:shadow-lg transition duration-200 hover:-translate-y-1 ${cardBg}`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="h-14 w-14 rounded-2xl bg-[#355872] text-white flex items-center justify-center text-2xl">
                    📁
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => toggleFavorite(project.id)} className="text-xl hover:scale-110 transition">
                      {isFavorite(project.id) ? "⭐" : "☆"}
                    </button>
                    <StatusBadge label={project.type} darkMode={darkMode} />
                    <StatusBadge label={status.label} darkMode={darkMode} variant={status.variant} />
                  </div>
                </div>

                <h3 className={`text-xl font-semibold mb-3 ${textMain}`}>
                  <SearchHighlight text={project.name} query={projectSearch} darkMode={darkMode} />
                </h3>

                <div className={`space-y-2 text-sm mb-6 ${textSub}`}>
                  <p>
                    <span className={`font-medium ${darkMode ? "text-gray-100" : "text-gray-700"}`}>Reports:</span>{" "}
                    {project.reports}
                  </p>
                  <p>
                    <span className={`font-medium ${darkMode ? "text-gray-100" : "text-gray-700"}`}>Last Date:</span>{" "}
                    {project.lastDate}
                  </p>
                  <p>
                    <span className={`font-medium ${darkMode ? "text-gray-100" : "text-gray-700"}`}>Country:</span>{" "}
                    {project.country}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className={textSub}>Project progress</span>
                    <span className={`font-medium ${textMain}`}>{Math.round(progress)}%</span>
                  </div>
                  <div className={`h-3 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                    <div
                      className="h-full bg-[#355872] rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      addRecentItem({
                        type: "project",
                        title: project.name,
                        subtitle: `${project.type} • ${project.country}`,
                      });
                      navigate("/project-details");
                    }}
                    className="bg-[#355872] hover:bg-[#7AAACE] text-white py-3 rounded-xl transition"
                  >
                    View Reports
                  </button>

                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      addRecentItem({
                        type: "project",
                        title: project.name,
                        subtitle: `${project.type} • ${project.country}`,
                      });
                      navigate("/project-details");
                    }}
                    className={`py-3 rounded-xl border transition ${
                      darkMode
                        ? "border-gray-600 text-gray-100 hover:bg-gray-800"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Details
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => startEditProject(project)}
                    className={`py-3 rounded-xl border transition ${
                      darkMode
                        ? "border-gray-600 text-gray-100 hover:bg-gray-800"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => confirmDeleteProject(project)}
                    className="py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}

          {filteredProjects.length === 0 && (
            <div className={`col-span-full border rounded-2xl p-10 text-center shadow-sm ${cardBg}`}>
              <div className="text-4xl mb-3">📂</div>
              <h3 className={`text-xl font-semibold mb-2 ${textMain}`}>No projects found</h3>
              <p className={textSub}>Try another keyword or clear the filters.</p>
              <button
                onClick={clearProjectFilters}
                className="mt-5 bg-[#355872] hover:bg-[#7AAACE] text-white px-5 py-3 rounded-xl transition"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-xl ${cardBg}`}>
            <h3 className={`text-xl font-bold mb-3 ${textMain}`}>Delete Project</h3>
            <p className={`${textSub} mb-6`}>
              Are you sure you want to delete{" "}
              <span className={`font-semibold ${textMain}`}>{projectToDelete?.name}</span>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setProjectToDelete(null);
                }}
                className={`px-4 py-2 rounded-xl border transition ${
                  darkMode
                    ? "border-gray-600 text-gray-100 hover:bg-gray-800"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteProject}
                className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProjectsPage;

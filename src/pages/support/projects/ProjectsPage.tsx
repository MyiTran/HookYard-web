import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import MyInvitationsList from "../../../components/projects/MyInvitationsList";
import ProjectCard from "../../../components/projects/ProjectCard";
import ProjectFormModal from "../../../components/projects/ProjectFormModal";
import { acceptInvitation, createProject, listMyInvitations, listProjects } from "../../../lib/projectApi";
import type { Project, ProjectInvitation } from "../../../types/project";
import type { CurrentUser } from "../../../types/user";

function ProjectsPage() {
  const user = useOutletContext<CurrentUser>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function loadProjects() {
    const result = await listProjects();

    if (result.ok) {
      setProjects(result.data);
      setError("");
      return;
    }

    setError(result.error);
  }

  async function loadInvitations() {
    const result = await listMyInvitations();

    if (result.ok) setInvitations(result.data);
  }

  useEffect(() => {
    async function load() {
      await Promise.all([loadProjects(), loadInvitations()]);
      setLoading(false);
    }

    load();
  }, []);

  async function handleCreate(name: string) {
    const result = await createProject(name);

    if (result.ok) await loadProjects();

    return result;
  }

  async function handleAccept(invitation: ProjectInvitation) {
    setInviteError("");
    setAcceptingId(invitation.id);

    const result = await acceptInvitation(invitation.id);

    if (!result.ok) {
      setInviteError(result.error);
      setAcceptingId(null);
      return;
    }

    await Promise.all([loadProjects(), loadInvitations()]);
    setAcceptingId(null);
  }

  return (
    <AppLayout user={user} title="Projects">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[2px] text-[#5D7063]">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-2 text-sm font-medium text-[#53665A]">
            Create projects, invite teammates and manage who can maintain each webhook workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex h-12 shrink-0 items-center rounded-xl bg-[#214E35] px-6 text-sm font-semibold text-white transition hover:bg-[#173D28]"
        >
          Create project
        </button>
      </div>

      {invitations.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[2px] text-[#5D7063]">Pending invitations</h2>

          {inviteError && (
            <p className="mt-3 rounded-xl bg-[#FBEEEE] px-4 py-3 text-sm text-[#B42318]">{inviteError}</p>
          )}

          <div className="mt-3">
            <MyInvitationsList invitations={invitations} acceptingId={acceptingId} onAccept={handleAccept} />
          </div>
        </section>
      )}

      <section className="mt-8">
        {loading ? (
          <p className="text-sm font-medium text-[#607267]">Loading projects...</p>
        ) : error ? (
          <div className="rounded-[18px] border border-[#F1D5D5] bg-[#FBEEEE] px-6 py-8 text-sm font-medium text-[#B42318]">
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-[#C2D4C7] bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
            <h3 className="text-lg font-semibold tracking-tight">No projects yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-[#607267]">
              Projects keep endpoints, deliveries and teammates together. Create your first one to get started.
            </p>

            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="mt-6 inline-flex h-12 items-center rounded-xl bg-[#214E35] px-6 text-sm font-semibold text-white transition hover:bg-[#173D28]"
            >
              Create project
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      {showCreate && (
        <ProjectFormModal
          title="Create project"
          submitLabel="Create project"
          initialName=""
          onSubmit={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}
    </AppLayout>
  );
}

export default ProjectsPage;

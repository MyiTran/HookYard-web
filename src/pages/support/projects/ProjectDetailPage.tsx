import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import CollaboratorsList from "../../../components/projects/CollaboratorsList";
import ConfirmDialog from "../../../components/projects/ConfirmDialog";
import InviteCollaboratorModal from "../../../components/projects/InviteCollaboratorModal";
import PendingInvitationsList from "../../../components/projects/PendingInvitationsList";
import ProjectFormModal from "../../../components/projects/ProjectFormModal";
import RoleBadge from "../../../components/projects/RoleBadge";
import { formatUserName } from "../../../lib/currentUser";
import { formatDate } from "../../../lib/dateFormat";
import {
  cancelInvitation,
  createInvitation,
  deleteProject,
  getProject,
  listMemberships,
  listProjectInvitations,
  removeMembership,
  updateProject,
} from "../../../lib/projectApi";
import type { Project, ProjectInvitation, ProjectMembership } from "../../../types/project";
import type { CurrentUser } from "../../../types/user";

function ProjectDetailPage() {
  const user = useOutletContext<CurrentUser>();
  const navigate = useNavigate();
  const { id: projectId = "" } = useParams();

  const [project, setProject] = useState<Project | null>(null);
  const [memberships, setMemberships] = useState<ProjectMembership[]>([]);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [membershipsError, setMembershipsError] = useState("");
  const [invitationsError, setInvitationsError] = useState("");
  const [actionError, setActionError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<ProjectMembership | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const projectResult = await getProject(projectId);

      if (cancelled) return;

      if (!projectResult.ok) {
        setUnavailable(projectResult.status === 404 || projectResult.status === 403);
        setLoadError(projectResult.error);
        setLoading(false);
        return;
      }

      setProject(projectResult.data);

      const isOwner = projectResult.data.current_user_role === "owner";
      const [membershipsResult, invitationsResult] = await Promise.all([
        listMemberships(projectId),
        isOwner ? listProjectInvitations(projectId) : Promise.resolve(null),
      ]);

      if (cancelled) return;

      if (membershipsResult.ok) setMemberships(membershipsResult.data);
      else setMembershipsError(membershipsResult.error);

      if (invitationsResult) {
        if (invitationsResult.ok) setInvitations(invitationsResult.data);
        else setInvitationsError(invitationsResult.error);
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  async function loadMemberships() {
    const result = await listMemberships(projectId);

    if (result.ok) {
      setMemberships(result.data);
      setMembershipsError("");
      return;
    }

    setMembershipsError(result.error);
  }

  async function loadInvitations() {
    const result = await listProjectInvitations(projectId);

    if (result.ok) {
      setInvitations(result.data);
      setInvitationsError("");
      return;
    }

    setInvitationsError(result.error);
  }

  async function handleUpdate(name: string) {
    const result = await updateProject(projectId, name);

    if (result.ok) setProject(result.data);

    return result;
  }

  async function handleDelete() {
    setActionError("");
    setDeleting(true);

    const result = await deleteProject(projectId);

    if (!result.ok) {
      setActionError(result.error);
      setDeleting(false);
      setShowDelete(false);
      return;
    }

    navigate("/projects");
  }

  async function handleRemove(membership: ProjectMembership) {
    setActionError("");
    setRemovingId(membership.id);

    const result = await removeMembership(projectId, membership.id);

    if (result.ok) await loadMemberships();
    else setActionError(result.error);

    setRemovingId(null);
    setConfirmRemove(null);
  }

  async function handleInvite(email: string) {
    const result = await createInvitation(projectId, email);

    if (result.ok) await loadInvitations();

    return result;
  }

  async function handleCancel(invitation: ProjectInvitation) {
    setActionError("");
    setCancellingId(invitation.id);

    const result = await cancelInvitation(projectId, invitation.id);

    if (result.ok) await loadInvitations();
    else setActionError(result.error);

    setCancellingId(null);
  }

  let body: ReactNode;

  if (loading) {
    body = <p className="mt-8 text-sm font-medium text-[#607267]">Loading project...</p>;
  } else if (unavailable) {
    body = (
      <div className="mt-8 rounded-[18px] border border-dashed border-[#C2D4C7] bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
        <h2 className="text-lg font-semibold tracking-tight">Project unavailable</h2>
        <p className="mx-auto mt-2 max-w-md text-sm font-medium text-[#607267]">
          This project does not exist or you do not have access to it.
        </p>

        <Link
          to="/projects"
          className="mt-6 inline-flex h-12 items-center rounded-xl bg-[#214E35] px-6 text-sm font-semibold text-white transition hover:bg-[#173D28]"
        >
          Back to projects
        </Link>
      </div>
    );
  } else if (!project) {
    body = (
      <div className="mt-8 rounded-[18px] border border-[#F1D5D5] bg-[#FBEEEE] px-6 py-8 text-sm font-medium text-[#B42318]">
        {loadError}
      </div>
    );
  } else {
    const isOwner = project.current_user_role === "owner";

    body = (
      <>
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-3xl font-semibold tracking-tight">{project.name}</h1>
              {project.current_user_role && <RoleBadge role={project.current_user_role} />}
            </div>

            <p className="mt-2 text-sm font-medium text-[#53665A]">Created {formatDate(project.created_at)}</p>
          </div>

          {isOwner && (
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => setShowEdit(true)}
                className="inline-flex h-11 items-center rounded-xl border border-[#C9DACE] px-5 text-sm font-semibold text-[#405348] transition hover:bg-[#F1F6F2]"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => setShowDelete(true)}
                className="inline-flex h-11 items-center rounded-xl border border-[#F1D5D5] px-5 text-sm font-semibold text-[#B42318] transition hover:bg-[#FBEEEE]"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {actionError && (
          <p className="mt-6 rounded-xl bg-[#FBEEEE] px-4 py-3 text-sm text-[#B42318]">{actionError}</p>
        )}

        <section className="mt-8 rounded-[18px] border border-[#D8E3DB] bg-white p-6 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Collaborators</h2>
              <p className="mt-1 text-sm font-medium text-[#718078]">People with access to this project.</p>
            </div>

            {isOwner && (
              <button
                type="button"
                onClick={() => setShowInvite(true)}
                className="inline-flex h-11 items-center rounded-xl bg-[#214E35] px-5 text-sm font-semibold text-white transition hover:bg-[#173D28]"
              >
                Invite collaborator
              </button>
            )}
          </div>

          <div className="mt-4">
            {membershipsError ? (
              <p className="rounded-xl bg-[#FBEEEE] px-4 py-3 text-sm text-[#B42318]">{membershipsError}</p>
            ) : (
              <CollaboratorsList
                memberships={memberships}
                currentUserRole={project.current_user_role}
                removingId={removingId}
                onRemove={setConfirmRemove}
              />
            )}
          </div>
        </section>

        {isOwner && (
          <section className="mt-6 rounded-[18px] border border-[#D8E3DB] bg-white p-6 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
            <h2 className="text-lg font-semibold tracking-tight">Pending invitations</h2>
            <p className="mt-1 text-sm font-medium text-[#718078]">Invitations waiting to be accepted.</p>

            <div className="mt-4">
              {invitationsError ? (
                <p className="rounded-xl bg-[#FBEEEE] px-4 py-3 text-sm text-[#B42318]">{invitationsError}</p>
              ) : invitations.length === 0 ? (
                <p className="text-sm font-medium text-[#607267]">No pending invitations.</p>
              ) : (
                <PendingInvitationsList
                  invitations={invitations}
                  cancellingId={cancellingId}
                  onCancel={handleCancel}
                />
              )}
            </div>
          </section>
        )}

        {showEdit && (
          <ProjectFormModal
            title="Edit project"
            submitLabel="Save changes"
            initialName={project.name}
            onSubmit={handleUpdate}
            onClose={() => setShowEdit(false)}
          />
        )}

        {showInvite && (
          <InviteCollaboratorModal onSubmit={handleInvite} onClose={() => setShowInvite(false)} />
        )}

        {showDelete && (
          <ConfirmDialog
            title="Delete project"
            description={`This permanently deletes "${project.name}" and revokes access for every collaborator.`}
            confirmLabel="Delete project"
            pendingLabel="Deleting..."
            loading={deleting}
            onConfirm={handleDelete}
            onCancel={() => setShowDelete(false)}
          />
        )}

        {confirmRemove && (
          <ConfirmDialog
            title="Remove collaborator"
            description={`Remove ${
              formatUserName(confirmRemove.user.first_name, confirmRemove.user.last_name) || "this collaborator"
            } from this project?`}
            confirmLabel="Remove"
            pendingLabel="Removing..."
            loading={removingId === confirmRemove.id}
            onConfirm={() => handleRemove(confirmRemove)}
            onCancel={() => setConfirmRemove(null)}
          />
        )}
      </>
    );
  }

  return (
    <AppLayout user={user} title={project?.name || "Projects"}>
      <Link to="/projects" className="text-sm font-semibold text-[#23613F] transition hover:underline">
        ← Projects
      </Link>

      {body}
    </AppLayout>
  );
}

export default ProjectDetailPage;

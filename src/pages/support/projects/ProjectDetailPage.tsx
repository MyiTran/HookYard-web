import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import AlertTriangleIcon from "../../../components/icons/AlertTriangleIcon";
import BoltIcon from "../../../components/icons/BoltIcon";
import CheckCircleIcon from "../../../components/icons/CheckCircleIcon";
import PlugIcon from "../../../components/icons/PlugIcon";
import ProjectEndpointsPanel from "../../../components/endpoints/ProjectEndpointsPanel";
import CollaboratorsList from "../../../components/projects/CollaboratorsList";
import InviteCollaboratorModal from "../../../components/projects/InviteCollaboratorModal";
import PendingInvitationsList from "../../../components/projects/PendingInvitationsList";
import ProjectFormModal from "../../../components/projects/ProjectFormModal";
import RoleBadge from "../../../components/projects/RoleBadge";
import Button from "../../../components/ui/Button";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import MetricCard from "../../../components/ui/MetricCard";
import { useToast } from "../../../components/ui/toastContext";
import { useNotifications } from "../../../hooks/notificationsContext";
import { formatUserName } from "../../../lib/currentUser";
import { formatDateTime } from "../../../lib/dateFormat";
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

  const { notifications, changeVersion } = useNotifications();
  const { showToast } = useToast();

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

  useEffect(() => {
    if (changeVersion === 0) return;

    const hasRelevantChange = notifications.some(
      (notification) =>
        notification.project_id === projectId &&
        notification.read_at === null &&
        (notification.kind === "project_invitation_accepted" ||
          notification.kind === "project_invitation_declined"),
    );

    if (!hasRelevantChange) return;

    let cancelled = false;

    async function refresh() {
      const [membershipsResult, invitationsResult] = await Promise.all([
        listMemberships(projectId),
        listProjectInvitations(projectId),
      ]);

      if (cancelled) return;

      if (membershipsResult.ok) setMemberships(membershipsResult.data);
      if (invitationsResult.ok) setInvitations(invitationsResult.data);
    }

    refresh();

    return () => {
      cancelled = true;
    };
  }, [changeVersion, notifications, projectId]);

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

    if (result.ok) {
      setProject(result.data);
      showToast({ type: "success", message: "Project updated successfully" });
    }

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

    showToast({ type: "success", message: "Project deleted successfully" });
    navigate("/projects");
  }

  async function handleRemove(membership: ProjectMembership) {
    setActionError("");
    setRemovingId(membership.id);

    const result = await removeMembership(projectId, membership.id);

    if (result.ok) {
      await loadMemberships();
      showToast({ type: "success", message: "Collaborator removed" });
    } else {
      setActionError(result.error);
    }

    setRemovingId(null);
    setConfirmRemove(null);
  }

  async function handleInvite(email: string) {
    const result = await createInvitation(projectId, email);

    if (result.ok) {
      await loadInvitations();
      showToast({ type: "success", message: "Invitation sent successfully" });
    } else {
      showToast({ type: "error", message: result.error });
    }

    return result;
  }

  async function handleCancel(invitation: ProjectInvitation) {
    setActionError("");
    setCancellingId(invitation.id);

    const result = await cancelInvitation(projectId, invitation.id);

    if (result.ok) {
      await loadInvitations();
      showToast({ type: "success", message: "Invitation cancelled" });
    } else {
      setActionError(result.error);
    }

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
    const memberLabel = `${memberships.length} member${memberships.length === 1 ? "" : "s"}`;
    const pendingLabel = `${invitations.length} pending invitation${invitations.length === 1 ? "" : "s"}`;
    const accessSummary = isOwner ? `${memberLabel} · ${pendingLabel}` : memberLabel;

    body = (
      <>
        <header className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-3xl font-semibold tracking-tight">{project.name}</h1>
              {project.current_user_role && <RoleBadge role={project.current_user_role} />}
            </div>

            <p className="mt-2 text-sm font-medium text-[#53665A]">Webhook operations workspace</p>
          </div>

          {isOwner && (
            <div className="flex shrink-0 gap-3">
              <Button variant="secondary" size="md" onClick={() => setShowEdit(true)}>
                Edit
              </Button>

              <Button variant="dangerOutline" size="md" onClick={() => setShowDelete(true)}>
                Delete
              </Button>
            </div>
          )}
        </header>

        {actionError && (
          <p className="mt-6 rounded-xl bg-[#FBEEEE] px-4 py-3 text-sm text-[#B42318]">{actionError}</p>
        )}

        <section className="mt-6 rounded-[18px] border border-[#D8E3DB] bg-white px-5 py-4 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
          <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Project information</h2>

          <dl className="mt-3 flex flex-wrap gap-x-12 gap-y-3">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Created</dt>
              <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">{formatDateTime(project.created_at)}</dd>
            </div>

            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Updated</dt>
              <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">{formatDateTime(project.updated_at)}</dd>
            </div>

            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Your role</dt>
              <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">{isOwner ? "Owner" : "Maintainer"}</dd>
            </div>
          </dl>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard tone="blue" label="Endpoints" value="—" unavailable icon={<PlugIcon />} />
          <MetricCard tone="purple" label="Events" value="—" unavailable icon={<BoltIcon />} />
          <MetricCard tone="green" label="Success rate" value="—" unavailable icon={<CheckCircleIcon />} />
          <MetricCard tone="red" label="Failed deliveries" value="—" unavailable icon={<AlertTriangleIcon />} />
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <ProjectEndpointsPanel project={project} />

          <section className="rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Project access</h2>
              <p className="mt-0.5 text-xs font-medium text-[#718078]">{accessSummary}</p>
            </div>

            {isOwner && (
              <Button variant="primary" size="sm" className="mt-3 w-full" onClick={() => setShowInvite(true)}>
                Invite collaborator
              </Button>
            )}

            <div className="mt-2">
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

            {isOwner && (
              <div className="mt-3 border-t border-[#E4EBE6] pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#B8862B]">
                  Pending invitations
                </p>

                <div className="mt-1">
                  {invitationsError ? (
                    <p className="rounded-xl bg-[#FBEEEE] px-4 py-3 text-sm text-[#B42318]">{invitationsError}</p>
                  ) : invitations.length === 0 ? (
                    <p className="py-2 text-xs font-medium text-[#8A9990]">No pending invitations.</p>
                  ) : (
                    <PendingInvitationsList
                      invitations={invitations}
                      cancellingId={cancellingId}
                      onCancel={handleCancel}
                    />
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

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

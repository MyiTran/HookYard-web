import { useEffect, useState } from "react";
import {
  createProjectApiCredential,
  listProjectApiCredentials,
  revokeProjectApiCredential,
} from "../../lib/apiCredentialApi";
import { formatDateTime } from "../../lib/dateFormat";
import type { CreatedProjectApiCredential, ProjectApiCredential } from "../../types/apiCredential";
import type { PaginationMeta } from "../../types/pagination";
import type { Project } from "../../types/project";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import ContextualHelp from "../ui/ContextualHelp";
import Pagination from "../ui/Pagination";
import { useToast } from "../ui/toastContext";
import ApiKeyFormModal from "./ApiKeyFormModal";
import ApiKeyTokenDialog from "./ApiKeyTokenDialog";
import EventIngestionHelp from "./EventIngestionHelp";

type ProjectApiKeysPanelProps = {
  project: Project;
};

function ProjectApiKeysPanel({ project }: ProjectApiKeysPanelProps) {
  const { showToast } = useToast();
  const [credentials, setCredentials] = useState<ProjectApiCredential[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [created, setCreated] = useState<CreatedProjectApiCredential | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<ProjectApiCredential | null>(null);
  const [revoking, setRevoking] = useState(false);

  const canManage = project.current_user_role === "owner";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const result = await listProjectApiCredentials(project.id, page);

      if (cancelled) return;

      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }

      const lastPage = Math.max(1, result.data.meta.last_page);

      if (page > lastPage) {
        setPage(lastPage);
        return;
      }

      setCredentials(result.data.data);
      setMeta(result.data.meta);
      setError("");
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [project.id, page, reloadToken]);

  async function handleCreate(name: string) {
    const result = await createProjectApiCredential(project.id, name);

    if (result.ok) {
      setCreated(result.data);
      setPage(1);
      setReloadToken((token) => token + 1);
      showToast({ type: "success", message: "API key created successfully" });
    }

    return result;
  }

  async function handleRevoke() {
    if (!revokeTarget) return;

    setActionError("");
    setRevoking(true);

    const result = await revokeProjectApiCredential(project.id, revokeTarget.id);

    setRevoking(false);
    setRevokeTarget(null);

    if (!result.ok) {
      setActionError(result.error);
      return;
    }

    setCredentials((current) =>
      current.map((credential) => (credential.id === result.data.id ? result.data : credential)),
    );
    showToast({ type: "success", message: "API key revoked" });
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
  }

  return (
    <section className="mt-6 rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Event ingestion</h2>

            <ContextualHelp label="How to send events" title="How to send events" widthRem={42}>
              <EventIngestionHelp />
            </ContextualHelp>
          </div>

          <p className="mt-1 max-w-2xl text-xs font-medium text-[#718078]">
            Use a project API key to authenticate event publishing from your source system.
          </p>
        </div>

        {canManage && (
          <Button variant="primary" size="sm" className="shrink-0" onClick={() => setShowCreate(true)}>
            Create API key
          </Button>
        )}
      </div>

      {actionError && (
        <p className="mt-4 rounded-xl bg-[#FBEEEE] px-4 py-3 text-sm text-[#B42318]">{actionError}</p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">API keys</h3>
        {!loading && !error && meta && (
          <span className="text-[11px] font-medium text-[#8A9990]">{meta.total_count} total</span>
        )}
      </div>

      <div className="mt-2">
        {loading && credentials.length === 0 ? (
          <p className="text-sm font-medium text-[#607267]">Loading API keys...</p>
        ) : error ? (
          <div className="rounded-xl bg-[#FBEEEE] px-4 py-3">
            <p className="text-sm font-medium text-[#B42318]">{error}</p>

            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => setReloadToken((token) => token + 1)}
            >
              Try again
            </Button>
          </div>
        ) : credentials.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-[#D8E3DB] px-5 py-8 text-center">
            <p className="text-sm font-semibold text-[#1F2A24]">No API keys yet</p>
            <p className="mx-auto mt-1 max-w-md text-xs font-medium text-[#8A9990]">
              Create a project API key so your source system can publish Events.
            </p>

            {canManage && (
              <Button variant="primary" size="sm" className="mt-4" onClick={() => setShowCreate(true)}>
                Create API key
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#E4EBE6]">
            <table className="w-full min-w-[40rem] text-left">
              <thead className="bg-[#F7FAF8]">
                <tr className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">
                  <th scope="col" className="px-4 py-2.5">Name</th>
                  <th scope="col" className="px-4 py-2.5">Token hint</th>
                  <th scope="col" className="px-4 py-2.5">Created</th>
                  <th scope="col" className="px-4 py-2.5">Status</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E4EBE6]">
                {credentials.map((credential) => {
                  const revoked = credential.status === "revoked";

                  return (
                    <tr key={credential.id}>
                      <td
                        className="max-w-[12rem] truncate px-4 py-3 text-sm font-semibold text-[#1F2A24]"
                        title={credential.name}
                      >
                        {credential.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[#8A9990]">
                        {credential.token_hint}…
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-[#718078]">
                        {formatDateTime(credential.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge tone={revoked ? "neutral" : "green"} dot>
                          {revoked ? "Revoked" : "Active"}
                        </Badge>
                        {revoked && credential.revoked_at && (
                          <p className="mt-1 text-[11px] text-[#8A9990]">
                            {formatDateTime(credential.revoked_at)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!revoked && canManage && (
                          <Button variant="dangerSoft" size="sm" onClick={() => setRevokeTarget(credential)}>
                            Revoke
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && meta && meta.last_page > 1 && (
        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={meta.last_page}
            totalCount={meta.total_count}
            pageSize={meta.page_size}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {showCreate && (
        <ApiKeyFormModal
          title="Create API key"
          submitLabel="Create API key"
          initialName=""
          description="This key lets a source system publish Events into this project. It is shown only once after creation."
          onSubmit={handleCreate}
          onCreated={() => setShowCreate(false)}
          onClose={() => setShowCreate(false)}
        />
      )}

      {created && (
        <ApiKeyTokenDialog token={created.token} keyName={created.name} onClose={() => setCreated(null)} />
      )}

      {revokeTarget && (
        <ConfirmDialog
          title="Revoke API key"
          description={`Revoke "${revokeTarget.name}"? Any source system using this key will immediately lose permission to publish Events into ${project.name}. This cannot be undone.`}
          confirmLabel="Revoke key"
          pendingLabel="Revoking..."
          loading={revoking}
          onConfirm={handleRevoke}
          onCancel={() => setRevokeTarget(null)}
        />
      )}
    </section>
  );
}

export default ProjectApiKeysPanel;

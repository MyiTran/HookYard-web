import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AccountPlanContext, type AccountPlanValue } from "../../hooks/accountPlanContext";
import { getAccount } from "../../lib/accountApi";
import type { AccountPlan } from "../../types/plan";
import type { CurrentUser } from "../../types/user";

type AccountPlanProviderProps = {
  user: CurrentUser;
  children: ReactNode;
};

function AccountPlanProvider({ user, children }: AccountPlanProviderProps) {
  const isAdmin = user.role === "admin";
  const [account, setAccount] = useState<AccountPlan | null>(null);
  const [loading, setLoading] = useState(!isAdmin);
  const [error, setError] = useState("");

  const refreshAccount = useCallback(async () => {
    if (isAdmin) return;

    setLoading(true);
    setError("");

    const result = await getAccount();

    if (result.ok) {
      setAccount(result.data);
    } else {
      setAccount(null);
      setError(result.error);
    }

    setLoading(false);
  }, [isAdmin]);

  const applyAccount = useCallback((nextAccount: AccountPlan) => {
    setAccount(nextAccount);
    setError("");
  }, []);

  useEffect(() => {
    if (isAdmin) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      const result = await getAccount();

      if (cancelled) return;

      if (result.ok) {
        setAccount(result.data);
      } else {
        setAccount(null);
        setError(result.error);
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const value: AccountPlanValue = {
    account,
    loading,
    error,
    refreshAccount,
    applyAccount,
  };

  return <AccountPlanContext.Provider value={value}>{children}</AccountPlanContext.Provider>;
}

export default AccountPlanProvider;

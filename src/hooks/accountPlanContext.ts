import { createContext, useContext } from "react";
import type { AccountPlan } from "../types/plan";

export type AccountPlanValue = {
  account: AccountPlan | null;
  loading: boolean;
  error: string;
  refreshAccount: () => Promise<void>;
  applyAccount: (account: AccountPlan) => void;
};

export const AccountPlanContext = createContext<AccountPlanValue | null>(null);

export function useAccountPlan(): AccountPlanValue {
  const value = useContext(AccountPlanContext);

  if (!value) {
    throw new Error("useAccountPlan must be used within an AccountPlanProvider");
  }

  return value;
}

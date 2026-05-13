export type Status = "READY" | "DEPLOYING" | "CLEAR";

export type Alert = {
  id: string;
  system: string;
  label: string;
  value: string;
};

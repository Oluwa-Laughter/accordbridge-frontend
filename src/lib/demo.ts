export type Role = "client" | "freelancer";
export type Stage =
  | "agreement"
  | "unfunded"
  | "funding-pending"
  | "funding-unknown"
  | "working"
  | "review"
  | "revision"
  | "payment-pending"
  | "released"
  | "disputed";
export type Submission = { version: number; notes: string };
export type DemoState = {
  stage: Stage;
  accepted: Record<Role, boolean>;
  submissions: Submission[];
  feedback: string;
  activity: string[];
};
export type Action =
  | { type: "accept"; role: Role }
  | { type: "fund"; role: Role }
  | { type: "funding-unknown" }
  | { type: "confirm-funding" }
  | { type: "submit"; role: Role; notes: string }
  | { type: "revise"; role: Role; feedback: string }
  | { type: "approve"; role: Role }
  | { type: "confirm-payment" }
  | { type: "dispute"; role: Role }
  | { type: "reset"; scenario: "new" | "funded" | "review" };

export function initialState(
  scenario: "new" | "funded" | "review" = "new",
): DemoState {
  return {
    stage:
      scenario === "new"
        ? "agreement"
        : scenario === "funded"
          ? "working"
          : "review",
    accepted: { client: scenario !== "new", freelancer: scenario !== "new" },
    submissions:
      scenario === "review"
        ? [
            {
              version: 1,
              notes:
                "Five page layouts with desktop and mobile variants are ready for review. Sample evidence only.",
            },
          ]
        : [],
    feedback: "",
    activity: [
      scenario === "new"
        ? "Agreement v1 prepared for both parties."
        : "Sample design milestone funding confirmed: 150 USDC.",
    ],
  };
}

// Prototype transitions only. This is not a contract or a production authorization boundary.
export function demoReducer(state: DemoState, action: Action): DemoState {
  const update = (patch: Partial<DemoState>, event: string): DemoState => ({
    ...state,
    ...patch,
    activity: [event, ...state.activity],
  });
  switch (action.type) {
    case "reset":
      return initialState(action.scenario);
    case "accept": {
      if (state.stage !== "agreement" || state.accepted[action.role])
        return state;
      const accepted = { ...state.accepted, [action.role]: true };
      return update(
        {
          accepted,
          stage:
            accepted.client && accepted.freelancer ? "unfunded" : "agreement",
        },
        `${action.role === "client" ? "Maya" : "Tobi"} accepted agreement v1 in this demo.`,
      );
    }
    case "fund":
      if (action.role !== "client" || state.stage !== "unfunded") return state;
      return update(
        { stage: "funding-pending" },
        "Simulated funding submitted; confirmation pending.",
      );
    case "funding-unknown":
      if (state.stage !== "funding-pending") return state;
      return update(
        { stage: "funding-unknown" },
        "Funding outcome unknown. Check the existing transaction before retrying.",
      );
    case "confirm-funding":
      if (!["funding-pending", "funding-unknown"].includes(state.stage))
        return state;
      return update(
        { stage: "working" },
        "Sample design funding confirmed: 150 USDC. Other milestones remain unfunded.",
      );
    case "submit":
      if (
        action.role !== "freelancer" ||
        !["working", "revision"].includes(state.stage) ||
        !action.notes.trim()
      )
        return state;
      const version = state.submissions.length + 1;
      return update(
        {
          stage: "review",
          submissions: [
            ...state.submissions,
            { version, notes: action.notes.trim() },
          ],
        },
        `Tobi submitted design v${version}.`,
      );
    case "revise":
      if (
        action.role !== "client" ||
        state.stage !== "review" ||
        !action.feedback.trim()
      )
        return state;
      return update(
        { stage: "revision", feedback: action.feedback.trim() },
        `Maya requested a revision to submission v${state.submissions.length}: ${action.feedback.trim()}`,
      );
    case "approve":
      if (action.role !== "client" || state.stage !== "review") return state;
      return update(
        { stage: "payment-pending" },
        `Maya approved submission v${state.submissions.length}; payment is still pending.`,
      );
    case "confirm-payment":
      if (state.stage !== "payment-pending") return state;
      return update(
        { stage: "released" },
        "Simulated payout confirmed: 149.55 USDC net to Tobi, 0.45 USDC illustrative provider fee.",
      );
    case "dispute":
      if (!["working", "review", "revision"].includes(state.stage))
        return state;
      return update(
        { stage: "disputed" },
        `${action.role === "client" ? "Maya" : "Tobi"} requested a reviewer decision. Funds remain held.`,
      );
  }
}

export function balances(state: DemoState) {
  const locked = [
    "working",
    "review",
    "revision",
    "payment-pending",
    "disputed",
  ].includes(state.stage)
    ? 150
    : 0;
  const released = state.stage === "released" ? 150 : 0;
  return {
    locked,
    released,
    disputed: state.stage === "disputed" ? 150 : 0,
    unfunded: 600 - locked - released,
  };
}

export const stageLabels: Record<Stage, string> = {
  agreement: "Awaiting acceptance",
  unfunded: "Awaiting funding",
  "funding-pending": "Funding pending",
  "funding-unknown": "Funding outcome unknown",
  working: "Ready for work",
  review: "Ready for review",
  revision: "Revision requested",
  "payment-pending": "Approved · payment pending",
  released: "Payment confirmed",
  disputed: "Reviewer decision pending",
};

import assert from "node:assert/strict";
import test from "node:test";
import { balances, demoReducer as reduce, initialState } from "./demo";
import { sampleAgreement, validateAgreement } from "./agreement";

test("published revisions invalidate acceptance, reject stale actions, and preserve history", () => {
  let state = initialState();
  state = reduce(state, { type: "accept", role: "client", version: 1 });
  state = reduce(state, { type: "accept", role: "freelancer", version: 1 });
  const proposal = structuredClone(state.agreement);
  proposal.milestones[0].amount = "225.50";
  state = reduce(state, {
    type: "publish-agreement",
    agreement: proposal,
    version: 1,
  });
  proposal.milestones[0].amount = "999";
  assert.equal(state.agreement.milestones[0].amount, "225.50");
  assert.equal(state.agreementVersion, 2);
  assert.deepEqual(state.accepted, { client: false, freelancer: false });
  assert.equal(state.history[0].agreement.milestones[0].amount, "150");
  assert.deepEqual(state.history[0].accepted, {
    client: true,
    freelancer: true,
  });
  assert.equal(
    reduce(state, { type: "accept", role: "client", version: 1 }),
    state,
  );
  assert.equal(
    reduce(state, {
      type: "publish-agreement",
      agreement: sampleAgreement(),
      version: 1,
    }),
    state,
  );
  assert.equal(reduce(state, { type: "fund", role: "client" }), state);
  state = reduce(state, { type: "accept", role: "client", version: 2 });
  state = reduce(state, { type: "accept", role: "freelancer", version: 2 });
  state = reduce(state, { type: "fund", role: "client" });
  assert.equal(
    reduce(state, {
      type: "publish-agreement",
      agreement: sampleAgreement(),
      version: 2,
    }),
    state,
  );
  state = reduce(state, { type: "confirm-funding" });
  assert.deepEqual(balances(state), {
    locked: 225.5,
    released: 0,
    disputed: 0,
    unfunded: 450,
  });
});

test("incomplete proposals, invalid amounts, and impossible dates cannot publish", () => {
  const state = initialState();
  for (const amount of ["", "0", "-1", "1.001", "Infinity", "1e3", "1000001"]) {
    const proposal = sampleAgreement();
    proposal.milestones[0].amount = amount;
    assert.equal(
      reduce(state, {
        type: "publish-agreement",
        agreement: proposal,
        version: 1,
      }),
      state,
    );
  }
  const invalid = sampleAgreement();
  invalid.milestones[0].dueDate = "2026-02-30";
  invalid.milestones[0].criteria = " ";
  assert.equal(validateAgreement(invalid).length, 2);
  assert.equal(
    reduce(state, { type: "create-agreement", agreement: invalid }),
    state,
  );
});

test("funding requires both parties and cannot settle on submission alone", () => {
  let state = initialState();
  assert.equal(reduce(state, { type: "fund", role: "client" }), state);
  state = reduce(state, { type: "accept", role: "client", version: 1 });
  assert.equal(reduce(state, { type: "fund", role: "client" }), state);
  state = reduce(state, { type: "accept", role: "freelancer", version: 1 });
  assert.equal(reduce(state, { type: "fund", role: "freelancer" }), state);
  state = reduce(state, { type: "fund", role: "client" });
  assert.equal(balances(state).locked, 0);
  state = reduce(state, { type: "funding-unknown" });
  assert.equal(reduce(state, { type: "fund", role: "client" }), state);
  assert.equal(
    reduce(state, { type: "submit", role: "freelancer", notes: "Work" }),
    state,
  );
  state = reduce(state, { type: "confirm-funding" });
  assert.deepEqual(balances(state), {
    locked: 150,
    released: 0,
    disputed: 0,
    unfunded: 450,
  });
});

test("revisions preserve versions; approval and release are separate", () => {
  let state = initialState("funded");
  assert.equal(
    reduce(state, { type: "submit", role: "client", notes: "Wrong role" }),
    state,
  );
  state = reduce(state, {
    type: "submit",
    role: "freelancer",
    notes: "Original layouts",
  });
  assert.equal(reduce(state, { type: "approve", role: "freelancer" }), state);
  assert.equal(reduce(state, { type: "confirm-payment" }), state);
  state = reduce(state, {
    type: "revise",
    role: "client",
    feedback: "Add mobile contact layout",
  });
  state = reduce(state, {
    type: "submit",
    role: "freelancer",
    notes: "Updated layouts",
  });
  assert.deepEqual(state.submissions, [
    { version: 1, notes: "Original layouts" },
    { version: 2, notes: "Updated layouts" },
  ]);
  state = reduce(state, { type: "approve", role: "client" });
  assert.equal(balances(state).locked, 150);
  assert.equal(balances(state).released, 0);
  state = reduce(state, { type: "confirm-payment" });
  assert.deepEqual(balances(state), {
    locked: 0,
    released: 150,
    disputed: 0,
    unfunded: 450,
  });
  assert.equal(reduce(state, { type: "confirm-payment" }), state);
  assert.equal(reduce(state, { type: "dispute", role: "client" }), state);
});

test("disputed funds remain a subset of held funds and block payout", () => {
  const state = reduce(initialState("review"), {
    type: "dispute",
    role: "client",
  });
  assert.deepEqual(balances(state), {
    locked: 150,
    released: 0,
    disputed: 150,
    unfunded: 450,
  });
  assert.equal(reduce(state, { type: "approve", role: "client" }), state);
  assert.equal(reduce(state, { type: "confirm-payment" }), state);
});

/* In-memory session state -------------------------------------------------
 * Deliberately not persisted: the tool is used per-RFP and "New RFP" clears
 * everything. Each requirement gets a record the moment it is first touched.
 */
var S = { step: 's1', view: 'steps', reqs: {} };

// Requirement state, created on demand.
function rs(id) {
  if (!S.reqs[id]) S.reqs[id] = { ck: false, na: false, note: '', ex: false };
  return S.reqs[id];
}

function stepById(sid) {
  return STEPS.find(function (s) { return s.id === sid; });
}

// Requirements marked in scope for one step.
function nCk(sid) {
  return stepById(sid).reqs.filter(function (r) { return rs(r.id).ck; }).length;
}

// Requirements marked in scope across all steps.
function tCk() {
  return STEPS.reduce(function (a, s) { return a + nCk(s.id); }, 0);
}

// Applicable requirements across all steps (i.e. everything not marked N/A).
function tRq() {
  return STEPS.reduce(function (a, s) {
    return a + s.reqs.filter(function (r) { return !rs(r.id).na; }).length;
  }, 0);
}

function toggleCk(id) { var st = rs(id); if (!st.na) st.ck = !st.ck; refresh(); }
function toggleNA(id) { var st = rs(id); st.na = !st.na; if (st.na) st.ck = false; refresh(); }
function toggleEx(id) { var st = rs(id); st.ex = !st.ex; refresh(); }

function resetState() {
  Object.keys(S.reqs).forEach(function (k) { delete S.reqs[k]; });
  S.step = 's1';
  S.view = 'steps';
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
          .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

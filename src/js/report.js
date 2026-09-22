/* Printable report -------------------------------------------------------
 * Builds a landscape A4 document into #report: cover, executive summary,
 * one in-depth chapter per canvas step, and a closing page. Hidden on screen,
 * shown only by @media print, so Ctrl+P produces the full report regardless
 * of which view the tool happens to be on.
 *
 * Every figure here is a count of requirements taken from the live session
 * state -- nothing is modelled or assumed.
 */

var RPT = {};          // static copy, from data/report.json
var exhibitNo = 0;     // exhibits are numbered sequentially across the document

function accentOf(canvas) { return (CC[canvas] || {}).accent || '#3d6bd6'; }

function pad2(n) { return (n < 10 ? '0' : '') + n; }

function reportDate() {
  var months = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
  var d = new Date();
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

/* -- figures ------------------------------------------------------------ */

// Coverage for one step: in scope / applicable, N/A removed from both sides.
function stepFigures(s) {
  var applicable = s.reqs.filter(function (r) { return !rs(r.id).na; });
  var inScope = applicable.filter(function (r) { return rs(r.id).ck; });
  return {
    step: s,
    total: s.reqs.length,
    applicable: applicable.length,
    inScope: inScope.length,
    na: s.reqs.length - applicable.length,
    pct: applicable.length ? Math.round(inScope.length / applicable.length * 100) : 0
  };
}

// Same, rolled up to a canvas group, in canvas order.
function canvasFigures() {
  var order = [], byName = {};
  STEPS.forEach(function (s) {
    if (!byName[s.canvas]) {
      byName[s.canvas] = { canvas: s.canvas, steps: [], total: 0, applicable: 0, inScope: 0, na: 0 };
      order.push(byName[s.canvas]);
    }
    var f = stepFigures(s), g = byName[s.canvas];
    g.steps.push(f);
    g.total += f.total;
    g.applicable += f.applicable;
    g.inScope += f.inScope;
    g.na += f.na;
  });
  order.forEach(function (g) {
    g.pct = g.applicable ? Math.round(g.inScope / g.applicable * 100) : 0;
  });
  return order;
}

function totals() {
  var t = { total: 0, applicable: 0, inScope: 0, na: 0, notes: 0 };
  STEPS.forEach(function (s) {
    var f = stepFigures(s);
    t.total += f.total;
    t.applicable += f.applicable;
    t.inScope += f.inScope;
    t.na += f.na;
    s.reqs.forEach(function (r) { if ((rs(r.id).note || '').trim()) t.notes++; });
  });
  t.pct = t.applicable ? Math.round(t.inScope / t.applicable * 100) : 0;
  return t;
}

/* -- shared page furniture ---------------------------------------------- */

function pageShell(n, of, cls, runningHead, body, finePrint) {
  return '<section class="rp ' + cls + '">' +
      '<header class="rp-top">' +
        '<div class="rp-brand"><span class="rp-logo"></span>' +
          '<span class="rp-wm">' + RPT.brand + '</span></div>' +
        (runningHead ? '<div class="rp-run">' + runningHead + '</div>' : '') +
        '<div class="rp-pg">PAGE ' + n + ' OF ' + of + '</div>' +
      '</header>' +
      '<div class="rp-rule"></div>' +
      '<div class="rp-body">' + body + '</div>' +
      '<div class="rp-fine">' + (finePrint || '') + '</div>' +
    '</section>';
}

function exhibit(title) {
  exhibitNo++;
  return '<div class="rp-exh"><span class="rp-exh-no">EXHIBIT ' + exhibitNo +
         '</span><span class="rp-exh-t">' + title + '</span></div>';
}

function metaCell(label, value) {
  return '<div class="rp-meta-c"><div class="rp-meta-l">' + label +
         '</div><div class="rp-meta-v">' + value + '</div></div>';
}

/* -- coverage bar -------------------------------------------------------- */

// One segmented bar across the step's full requirement count: in scope filled
// in the canvas accent, applicable-but-unmarked hollow, not-applicable hatched.
function coverageBar(f, accent) {
  if (!f.total) return '';
  var seg = function (count, cls, style) {
    if (!count) return '';
    return '<div class="rp-seg ' + cls + '" style="flex:' + count +
           (style ? ';' + style : '') + '"></div>';
  };
  return '<div class="rp-bar">' +
      seg(f.inScope, 'is', 'background:' + accent) +
      seg(f.applicable - f.inScope, 'open', '') +
      seg(f.na, 'na', '') +
    '</div>';
}

function barKey(f, accent) {
  var k = '<span class="rp-k"><span class="rp-sw" style="background:' + accent +
          '"></span>In scope <b>' + f.inScope + '</b></span>';
  if (f.applicable - f.inScope > 0) {
    k += '<span class="rp-k"><span class="rp-sw open"></span>Not marked <b>' +
         (f.applicable - f.inScope) + '</b></span>';
  }
  if (f.na > 0) {
    k += '<span class="rp-k"><span class="rp-sw na"></span>Not applicable <b>' +
         f.na + '</b></span>';
  }
  return '<div class="rp-key">' + k + '</div>';
}

/* -- page 1: cover ------------------------------------------------------- */

function coverPage(ctx) {
  var t = ctx.totals;

  var cols = ctx.groups.map(function (g) {
    return '<div class="rp-lev" style="border-top-color:' + accentOf(g.canvas) + '">' +
        '<div class="rp-lev-l">' + g.canvas.toUpperCase() + '</div>' +
        '<div class="rp-lev-n">' + g.inScope +
          '<span class="rp-lev-d">/' + g.applicable + '</span></div>' +
        '<div class="rp-lev-s">' + g.pct + '% of applicable &middot; ' + g.steps.length +
          (g.steps.length === 1 ? ' canvas step' : ' canvas steps') + '</div>' +
      '</div>';
  }).join('');

  var notes = RPT.coverNotes.map(function (n) {
    return '<div class="rp-note"><div class="rp-note-l">' + n.label +
           '</div><div class="rp-note-t">' + n.text + '</div></div>';
  }).join('');

  var body =
    '<div class="rp-kick">' + RPT.kicker + '</div>' +
    '<h1 class="rp-h1">' + escHtml(ctx.engagement) + '</h1>' +
    '<div class="rp-sub">' + RPT.subtitle + '</div>' +
    '<div class="rp-hr"></div>' +
    '<div class="rp-big">' + t.inScope + ' / ' + t.applicable + '</div>' +
    '<div class="rp-bigcap">REQUIREMENTS IN SCOPE &middot; ' + t.pct +
      '% OF APPLICABLE &middot; ' + t.na + ' MARKED NOT APPLICABLE &middot; ' +
      STEPS.length + ' CANVAS STEPS ASSESSED</div>' +
    '<div class="rp-levs">' + cols + '</div>' +
    '<div class="rp-meta">' +
      metaCell('PREPARED FOR', escHtml(ctx.engagement)) +
      metaCell('OEM TYPE', ctx.archetype) +
      metaCell('BASIS', 'Requirement library v2.0') +
      metaCell('DATE PREPARED', ctx.date) +
      metaCell('REQUIREMENTS ASSESSED', String(t.total)) +
      metaCell('CANVAS STEPS', String(STEPS.length)) +
      metaCell('NOTES RECORDED', String(t.notes)) +
      metaCell('METHOD', ctx.groups.length + ' canvas groups &middot; ' +
                         STEPS.length + ' steps') +
    '</div>' +
    '<div class="rp-notes">' + notes + '</div>';

  return pageShell(1, ctx.pages, 'rp-cover', '', body,
    'Counts are taken from the requirement library shipped with this tool and the assessment ' +
    'recorded against this RFP. They describe which requirements were judged to apply; please ' +
    'read the closing page before drawing conclusions from them.');
}

/* -- page 2: executive summary ------------------------------------------- */

function execPage(ctx) {
  var t = ctx.totals;
  var ranked = ctx.groups.slice().sort(function (a, b) { return b.inScope - a.inScope; });
  var top = ranked[0];

  var headline;
  if (!t.inScope) {
    headline = 'No requirements have been marked in scope for this RFP yet.';
  } else if (top && top.inScope) {
    headline = 'This RFP loads ' + top.canvas + ' hardest — ' + top.inScope +
               ' of the ' + t.inScope + ' requirements in scope sit there.';
  } else {
    headline = 'This RFP spreads evenly across the canvas.';
  }

  var stand = '<b>' + escHtml(ctx.engagement) + '</b> raises ' + t.inScope + ' of the ' +
    t.applicable + ' requirements that apply to it, or <b>' + t.pct +
    '%</b> of the applicable library, across ' + STEPS.length +
    ' steps of the aftermarket pricing canvas. ' + t.na +
    (t.na === 1 ? ' requirement was' : ' requirements were') +
    ' judged not applicable and removed from the calculation rather than counted as a gap' +
    (t.notes ? ', and ' + t.notes +
      (t.notes === 1 ? ' requirement carries a note' : ' requirements carry a note') +
      ' recorded against it' : '') + '.';

  var callouts =
    '<div class="rp-call"><div class="rp-call-l">WHAT IS IN SCOPE</div>' +
      '<div class="rp-call-n">' + t.inScope + ' / ' + t.applicable + '</div>' +
      '<div class="rp-call-t">Requirements this RFP is judged to be asking for, ' +
        'out of those that apply to it.</div></div>' +
    '<div class="rp-call"><div class="rp-call-l">WHERE IT CONCENTRATES</div>' +
      '<div class="rp-call-n">' +
        ranked.slice(0, 3).map(function (g) { return g.inScope; }).join(' / ') + '</div>' +
      '<div class="rp-call-t">' +
        ranked.slice(0, 3).map(function (g) { return g.canvas; }).join(', ') +
        ' — the three canvas groups carrying the most of this RFP.</div></div>' +
    '<div class="rp-call"><div class="rp-call-l">WHAT IS OUT OF SCOPE</div>' +
      '<div class="rp-call-n">' + t.na + '</div>' +
      '<div class="rp-call-t">Requirements marked not applicable. They are excluded from ' +
        'both sides of every coverage figure on these pages.</div></div>';

  var groupRows = ctx.groups.map(function (g) {
    return '<div class="rp-gr">' +
        '<div class="rp-gr-n" style="color:' + accentOf(g.canvas) + '">' + g.canvas + '</div>' +
        '<div class="rp-gr-b">' + coverageBar(g, accentOf(g.canvas)) + '</div>' +
        '<div class="rp-gr-c">' + g.inScope + '/' + g.applicable + '</div>' +
        '<div class="rp-gr-p">' + g.pct + '%</div>' +
      '</div>';
  }).join('');

  var stepRows = STEPS.map(stepFigures).sort(function (a, b) {
    return b.inScope - a.inScope || a.step.n - b.step.n;
  }).map(function (f) {
    return '<tr>' +
        '<td class="rp-t-n" style="color:' + accentOf(f.step.canvas) + '">' +
          pad2(f.step.n) + '</td>' +
        '<td class="rp-t-s">' + f.step.name + '</td>' +
        '<td class="rp-t-g">' + f.step.canvas + '</td>' +
        '<td class="rp-t-o">' + f.step.owner + '</td>' +
        '<td class="rp-t-c">' + f.inScope + '/' + f.applicable + '</td>' +
        '<td class="rp-t-c">' + f.na + '</td>' +
        '<td class="rp-t-b">' + coverageBar(f, accentOf(f.step.canvas)) + '</td>' +
        '<td class="rp-t-p">' + f.pct + '%</td>' +
      '</tr>';
  }).join('');

  var gloss = RPT.glossary.map(function (g) {
    return '<div class="rp-gl"><div class="rp-gl-l">' + g.label +
           '</div><div class="rp-gl-t">' + g.text + '</div></div>';
  }).join('');

  var body =
    '<div class="rp-kick">EXECUTIVE SUMMARY</div>' +
    '<h2 class="rp-h2">' + headline + '</h2>' +
    '<p class="rp-stand">' + stand + '</p>' +
    '<div class="rp-calls">' + callouts + '</div>' +
    '<div class="rp-cols">' +
      '<div class="rp-col rp-col-a">' +
        exhibit('Coverage by canvas group') +
        '<div class="rp-grs">' + groupRows + '</div>' +
        '<div class="rp-cap">Each bar runs the full requirement count for that group. Filled is ' +
          'in scope, hollow is applicable but not marked, hatched is not applicable.</div>' +
      '</div>' +
      '<div class="rp-col rp-col-b">' +
        exhibit('Coverage by canvas step, ranked') +
        '<table class="rp-tbl"><thead><tr>' +
          '<th></th><th>STEP</th><th>CANVAS GROUP</th><th>OWNER</th>' +
          '<th class="rp-t-c">SCOPE</th><th class="rp-t-c">N/A</th>' +
          '<th></th><th class="rp-t-p">%</th>' +
        '</tr></thead><tbody>' + stepRows + '</tbody></table>' +
        '<div class="rp-cap">Ranked by requirements in scope, not by step number. The steps ' +
          'carrying the most of this RFP appear first.</div>' +
      '</div>' +
    '</div>' +
    '<div class="rp-gls">' + gloss + '</div>';

  return pageShell(2, ctx.pages, 'rp-light', ctx.runHead, body, ctx.fine);
}

/* -- pages 3..n: one chapter per canvas step ----------------------------- */

function stepPage(f, pageNo, ctx) {
  var s = f.step, accent = accentOf(s.canvas);

  var headline;
  if (!f.applicable) {
    headline = s.name + ' carries no applicable requirements for this RFP.';
  } else if (f.inScope === f.applicable) {
    headline = 'Every applicable requirement in ' + s.name + ' is raised by this RFP.';
  } else if (!f.inScope) {
    headline = 'This RFP does not load ' + s.name + '.';
  } else {
    headline = f.inScope + ' of the ' + f.applicable + ' requirements in ' + s.name +
               ' are raised by this RFP.';
  }

  var stand = '<b>' + s.name + '</b> covers ' +
    s.desc.charAt(0).toLowerCase() + s.desc.slice(1).replace(/\.$/, '') +
    '. It sits in <b>' + s.canvas + '</b> and is owned by <b>' + s.owner + '</b>. Of its ' +
    f.total + (f.total === 1 ? ' requirement, ' : ' requirements, ') + f.inScope +
    (f.inScope === 1 ? ' is' : ' are') + ' in scope' +
    (f.na ? ' and ' + f.na + (f.na === 1 ? ' is' : ' are') + ' not applicable' : '') + '.';

  var cards = s.reqs.map(function (r) {
    var st = rs(r.id);
    var cls = st.na ? 'na' : (st.ck ? 'is' : 'open');
    var mark = st.na ? 'NOT APPLICABLE' : (st.ck ? 'IN SCOPE' : 'NOT MARKED');
    var note = (st.note || '').trim();
    return '<div class="rp-req ' + cls + '" style="border-left-color:' +
        (st.ck && !st.na ? accent : '#dce2e9') + '">' +
        '<div class="rp-req-h">' +
          '<span class="rp-req-id">' + r.id + '</span>' +
          '<span class="rp-req-t">' + r.title + '</span>' +
          '<span class="rp-req-m ' + cls + '">' + mark + '</span>' +
        '</div>' +
        '<div class="rp-req-p">' + r.plain + '</div>' +
        '<div class="rp-req-tags">' +
          '<span class="rp-tag">' + r.src + '</span>' +
          '<span class="rp-tag">COMPLEXITY &middot; ' + r.cx.toUpperCase() + '</span>' +
          '<span class="rp-tag">' + r.ref + '</span>' +
        '</div>' +
        (note ? '<div class="rp-req-note"><span class="rp-req-note-l">NOTE</span>' +
                escHtml(note).replace(/\n/g, '<br>') + '</div>' : '') +
      '</div>';
  }).join('');

  var body =
    '<div class="rp-kick" style="color:' + accent + '">STEP ' + s.n + ' OF ' + STEPS.length +
      ' &middot; ' + s.canvas.toUpperCase() + '</div>' +
    '<h2 class="rp-h2">' + headline + '</h2>' +
    '<p class="rp-stand">' + stand + '</p>' +
    exhibit('Coverage for this step') +
    coverageBar(f, accent) +
    barKey(f, accent) +
    exhibit('The requirements on this step') +
    '<div class="rp-reqs">' + cards + '</div>' +
    '<div class="rp-meta rp-meta-lt">' +
      metaCell('CANVAS GROUP', s.canvas) +
      metaCell('OWNER', s.owner) +
      metaCell('REQUIREMENTS', String(f.total)) +
      metaCell('IN SCOPE', f.inScope + ' / ' + f.applicable) +
      metaCell('NOT APPLICABLE', String(f.na)) +
    '</div>';

  return pageShell(pageNo, ctx.pages, 'rp-light', ctx.runHead, body, ctx.fine);
}

/* -- final page ---------------------------------------------------------- */

function closingPage(ctx) {
  var body =
    '<div class="rp-close">' +
      '<div class="rp-kick">' + RPT.closing.title.toUpperCase() + '</div>' +
      RPT.closing.paragraphs.map(function (p) {
        return '<p class="rp-close-p">' + p + '</p>';
      }).join('') +
    '</div>';
  return pageShell(ctx.pages, ctx.pages, 'rp-light rp-closing', ctx.runHead, body, ctx.fine);
}

/* -- assembly ------------------------------------------------------------ */

function buildReport() {
  exhibitNo = 0;

  var arcEl = document.getElementById('arcSel');
  var ctx = {
    engagement: (document.getElementById('engIn').value || '').trim() || 'Unnamed RFP',
    archetype: arcEl.value ? arcEl.options[arcEl.selectedIndex].text : 'Not specified',
    date: reportDate(),
    totals: totals(),
    groups: canvasFigures(),
    pages: 2 + STEPS.length + 1
  };
  ctx.runHead = [RPT.kicker, ctx.engagement.toUpperCase(),
                 ctx.archetype.toUpperCase()].join(' &middot; ');
  ctx.fine = 'Counts describe this RFP as assessed in the tool, not the organisation behind it. ' +
             'Requirement text and canvas reference are printed with each entry so that any ' +
             'individual placement can be examined on its own. See the closing page.';

  var html = coverPage(ctx) + execPage(ctx);
  STEPS.map(stepFigures).forEach(function (f, i) {
    html += stepPage(f, 3 + i, ctx);
  });
  html += closingPage(ctx);

  document.getElementById('report').innerHTML = html;
}

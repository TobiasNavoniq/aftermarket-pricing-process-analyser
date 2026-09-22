/* Coverage summary: per-step totals, handover note, print view */

function showSum() {
  S.view = 'summary';
  document.getElementById('sv').style.display = 'none';
  document.getElementById('sumv').style.display = '';

  var eng = document.getElementById('engIn').value || 'Unnamed RFP';
  var arcEl = document.getElementById('arcSel');
  var arc = arcEl.options[arcEl.selectedIndex] ? arcEl.options[arcEl.selectedIndex].text : '&mdash;';

  var total = STEPS.reduce(function (a, s) { return a + s.reqs.length; }, 0);
  var ck = tCk(), ap = tRq(), na = total - ap;

  var rows = STEPS.map(function (s) {
    var cv = nCk(s.id);
    var t = s.reqs.filter(function (r) { return !rs(r.id).na; }).length;
    var pct = t > 0 ? Math.round(cv / t * 100) : 0;
    var col = CC[s.canvas] || {};
    return '<div class="smr">' +
        '<div class="smrn" style="background:' + col.tx + ';">' + s.n + '</div>' +
        '<div class="smrname">' + s.name +
          ' <span style="font-size:10px;font-weight:400;color:var(--mu)">' + s.canvas + '</span></div>' +
        '<div class="smrbar"><div class="smrfill" style="width:' + pct + '%;background:' + col.tx + '"></div></div>' +
        '<div class="smrcnt">' + cv + '/' + t + '</div>' +
        '<div class="smrpct">' + pct + '%</div>' +
      '</div>';
  }).join('');

  document.getElementById('sumv').innerHTML =
    '<div class="smh">' +
      '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;' +
        'color:var(--tm);margin-bottom:4px">Coverage Summary</div>' +
      '<div class="smtit">' + eng + '</div>' +
      '<div class="smsub">' + arc + ' &middot; ' + STEPS.length + '-step Aftermarket Pricing Canvas</div>' +
      '<div class="smst">' +
        statCard(ck, 'In scope') +
        statCard(ap, 'Applicable') +
        statCard(na, 'Marked N/A') +
        statCard((ap > 0 ? Math.round(ck / ap * 100) : 0) + '%', 'Mapped') +
      '</div>' +
    '</div>' +
    '<div class="cvsec">' +
      '<div class="cvtit">Step-by-step coverage</div>' +
      '<div class="cvsub">Requirements marked in scope for this RFP, per canvas step</div>' +
      '<div class="smrows">' + rows + '</div>' +
    '</div>' +
    notesSection() +
    '<div class="nextstep"><div class="nextstep-icon">&#8594;</div><div>' +
      '<strong>Next: bring this into the Aftermarket Pricing Process Analyser.</strong> Open the ' +
      'ThinkTrooper Aftermarket Pricing Process Analyser, enter the same OEM/account name, and use ' +
      'this mapping to know which ' +
      'of the 9 canvas steps to focus on first. That tool builds the pain heat map and priority roadmap ' +
      'for your internal RFP-response prep &mdash; it is not shown to the OEM either.' +
    '</div></div>' +
    '<div style="display:flex;gap:8px;margin-top:4px">' +
      '<button class="snb" id="backBtn">&#8592; Back to requirements</button>' +
      '<button class="snb p" id="printBtn">Print / Save PDF</button>' +
    '</div>';

  document.getElementById('backBtn').addEventListener('click', function () { goStep(S.step); });
  document.getElementById('printBtn').addEventListener('click', function () {
    buildReport();
    window.print();
  });
  renderSB();
}

// Notes the reader typed against individual requirements. Omitted entirely
// when nothing has been written, so a clean report stays clean.
function notesSection() {
  var noted = [];
  STEPS.forEach(function (s) {
    s.reqs.forEach(function (r) {
      var note = (rs(r.id).note || '').trim();
      if (note) noted.push({ step: s, req: r, note: note });
    });
  });
  if (!noted.length) return '';

  var rows = noted.map(function (n) {
    return '<div class="ntrow">' +
        '<div class="ntmeta">' +
          '<span class="ntid">' + n.req.id + '</span>' +
          '<span class="ntstep">Step ' + n.step.n + ' &middot; ' + n.step.name + '</span>' +
        '</div>' +
        '<div class="nttitle">' + n.req.title + '</div>' +
        '<div class="nttext">' + escHtml(n.note).replace(/\n/g, '<br>') + '</div>' +
      '</div>';
  }).join('');

  return '<div class="cvsec ntsec">' +
      '<div class="cvtit ntsectitle">Notes and observations</div>' +
      '<div class="cvsub">' + noted.length +
        (noted.length === 1 ? ' requirement has' : ' requirements have') +
        ' a note recorded against it for this RFP</div>' +
      rows +
    '</div>';
}

function statCard(n, label) {
  return '<div class="ssc"><div class="ssn">' + n + '</div><div class="ssl">' + label + '</div></div>';
}

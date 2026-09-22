/* Step view: the requirement checklist for one canvas step */

// One requirement card, including its collapsed detail panel.
function reqCard(step, colours, r) {
  var st = rs(r.id);
  return '' +
    '<div class="rc' + (st.ck ? ' ck' : '') + (st.na ? ' na' : '') + '" id="rc-' + r.id + '">' +
      '<div class="rct" data-rid="' + r.id + '">' +
        '<div class="rcb"><span class="rcbck">&#10003;</span></div>' +
        '<div class="rm">' +
          '<div class="ridr">' +
            '<span class="rid">' + r.id + '</span>' +
            '<span class="rsrc">' + r.src + '</span>' +
            '<span class="rctg" style="background:' + colours.bg + ';color:' + colours.tx +
              ';border:1px solid ' + colours.bd + '">' + step.canvas + '</span>' +
          '</div>' +
          '<div class="rtit">' + r.title + '</div>' +
          '<div class="rpln">' + r.plain + '</div>' +
        '</div>' +
        '<div class="ract">' +
          '<button class="rbtn" data-rid="' + r.id + '" data-act="na">' +
            (st.na ? 'Restore' : 'N/A') + '</button>' +
          '<button class="rbtn" data-rid="' + r.id + '" data-act="ex">' +
            (st.ex ? '&#9650; Less' : '&#9660; Detail') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="rdt' + (st.ex ? ' op' : '') + '" id="dt-' + r.id + '">' +
        '<div class="dg">' +
          detailBox('Canvas step', 'Step ' + step.n + ' &mdash; ' + step.name, 'dbc') +
          detailBox('Canvas reference', r.ref) +
          detailBox('Complexity', r.cx) +
          detailBox('Source', r.src) +
          '<div class="db df"><div class="dbl">Notes for this RFP</div>' +
            '<textarea class="notei" data-rid="' + r.id + '" ' +
              'placeholder="Add specific wording or context from your RFP here&hellip;">' +
              escHtml(st.note || '') + '</textarea></div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function detailBox(label, value, cls) {
  return '<div class="db"><div class="dbl">' + label + '</div>' +
         '<div class="' + (cls || 'dbt') + '">' + value + '</div></div>';
}

function renderStep(sid) {
  var step = stepById(sid);
  if (!step) return;
  var colours = CC[step.canvas] || {};
  var idx = STEPS.findIndex(function (s) { return s.id === sid; });

  var rh = step.reqs.map(function (r) { return reqCard(step, colours, r); }).join('');

  var nav = '<button class="snb" id="prevBtn"' + (idx === 0 ? ' disabled' : '') + '>&#8592; Previous</button>' +
            '<span style="font-size:11px;color:var(--mu)">' + nCk(step.id) + ' of ' + step.reqs.length + ' marked</span>' +
            (idx < STEPS.length - 1
              ? '<button class="snb p" id="nextBtn" data-next="' + STEPS[idx + 1].id + '">Next &#8594;</button>'
              : '<button class="snb p" id="sumBtn2">Coverage summary &#8594;</button>');

  document.getElementById('sv').innerHTML =
    '<div class="sh">' +
      '<div class="sey">Step ' + step.n + ' of ' + STEPS.length + ' &middot; ' + step.canvas + '</div>' +
      '<div class="stit">' + step.name + '</div>' +
      '<div class="sdsc">' + step.desc + '</div>' +
      '<div class="stags">' +
        '<span class="stag">Owner: ' + step.owner + '</span>' +
        '<span class="stag">' + step.reqs.length + ' requirements</span>' +
        '<span class="stag">' + nCk(step.id) + ' in scope</span>' +
      '</div>' +
    '</div>' +
    '<div class="rsec"><div class="rsectitle">Requirements for this step</div>' + rh + '</div>' +
    '<div class="snav">' + nav + '</div>';

  wireStepEvents(idx);
}

function wireStepEvents(idx) {
  document.querySelectorAll('.rct').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (btn) {
        e.stopPropagation();
        var rid = btn.getAttribute('data-rid');
        if (btn.getAttribute('data-act') === 'na') toggleNA(rid); else toggleEx(rid);
        return;
      }
      toggleCk(el.getAttribute('data-rid'));
    });
  });

  document.querySelectorAll('.notei').forEach(function (el) {
    el.addEventListener('input', function () { rs(el.getAttribute('data-rid')).note = el.value; });
    el.addEventListener('click', function (e) { e.stopPropagation(); });
  });

  var pb = document.getElementById('prevBtn');
  if (pb) pb.addEventListener('click', function () { goStep(STEPS[idx - 1].id); });
  var nb = document.getElementById('nextBtn');
  if (nb) nb.addEventListener('click', function () { goStep(nb.getAttribute('data-next')); });
  var sb2 = document.getElementById('sumBtn2');
  if (sb2) sb2.addEventListener('click', showSum);
}

function goStep(sid) {
  if (!sid) return;
  S.step = sid;
  S.view = 'steps';
  document.getElementById('sv').style.display = '';
  document.getElementById('sumv').style.display = 'none';
  document.getElementById('mn').scrollTop = 0;
  refresh();
}

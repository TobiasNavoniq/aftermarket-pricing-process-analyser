/* Left sidebar: step list, progress bar, header pill */

function renderSB() {
  var html = '';
  STEPS.forEach(function (s) {
    var c = nCk(s.id), t = s.reqs.length;
    var act = s.id === S.step && S.view === 'steps';
    html +=
      '<div class="si' + (act ? ' act' : '') + '" data-sid="' + s.id + '">' +
        '<div class="sinum">' + s.n + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div class="sinm">' + s.name + '</div>' +
          '<div class="simt">' + s.canvas + '</div>' +
        '</div>' +
        '<div class="sibg' + (c === 0 ? ' z' : '') + '">' + c + '/' + t + '</div>' +
      '</div>';
  });
  document.getElementById('sbsteps').innerHTML = html;

  document.querySelectorAll('.si').forEach(function (el) {
    el.addEventListener('click', function () { goStep(el.getAttribute('data-sid')); });
  });

  var pct = tRq() > 0 ? Math.round(tCk() / tRq() * 100) : 0;
  document.getElementById('pPct').textContent = pct + '%';
  document.getElementById('pFill').style.width = pct + '%';
  document.getElementById('npill').textContent = tCk() + ' / ' + tRq() + ' marked';
}

/* Phone layer loader. Copied from the lab by scripts/sync-mobile.py; do not edit the other files in this folder.
   A page opts in with, at the end of <body> after its own scripts:
     <script src="mobile/load.js" data-page="travel-technology" data-v="1"></script>
   and in <head> the stylesheets with media="(max-width:599px)". On wider screens nothing here runs, so desktop and
   tablet stay exactly as they are. */
(() => {
  if (!matchMedia('(max-width:599px)').matches) return;
  const me = document.currentScript, base = me.src.replace(/load\.js(\?.*)?$/, ''), page = me.dataset.page, v = me.dataset.v || '1';
  const list = ['patterns.js', `pages/${page}.js`, `roles/${page}.js`, 'rhythm.js'];
  const next = i => {
    if (i >= list.length) return;
    const s = document.createElement('script'); s.src = `${base}${list[i]}?v=${v}`;
    s.onload = s.onerror = () => next(i + 1); document.body.appendChild(s);
  };
  next(0);
})();

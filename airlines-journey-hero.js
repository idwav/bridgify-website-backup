(() => {
 const root = document.querySelector('.aj-hero');
 const dialog = root.querySelector('.aj-dialog');
 root.querySelectorAll('[data-aj-open]').forEach(button => button.addEventListener('click', () => {
  const ticket = button.dataset.ajOpen === 'ticket';
  dialog.querySelector('[data-aj-title]').textContent = ticket ? 'Your experience ticket' : 'Seine River Cruise';
  dialog.querySelector('[data-aj-copy]').textContent = ticket ? 'Skyline Air · Paris · Seine River Cruise. This preview illustrates the confirmation a passenger receives after booking. It is not a valid ticket.' : 'Discover Paris from the river. This preview shows how a destination experience can appear under your airline’s brand, alongside the passenger’s flight.';
  dialog.showModal();
 }));
 dialog.querySelectorAll('.aj-close,.aj-dismiss').forEach(button => button.addEventListener('click', () => dialog.close()));
 dialog.addEventListener('click', event => {if(event.target === dialog) dialog.close();});
})();

(() => {
 const scene = document.querySelector('.ap-platform');
 if (!scene) return;
 const product = scene.querySelector('.ap-product');
 const categories = [...scene.querySelectorAll('[data-category]')];
 const customers = [...scene.querySelectorAll('[data-customer]')];
 function select(index) {
  categories.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  customers.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
 }
 categories.forEach((button, i) => button.addEventListener('click', () => select(i)));
 customers.forEach((button, i) => button.addEventListener('click', () => select(i)));
 scene.querySelectorAll('button[data-channel]').forEach(button => button.addEventListener('click', () => {
  product.dataset.channel = button.dataset.channel;
  scene.querySelectorAll('button[data-channel]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
 }));
 // Keep the connector between stacked panels even when text wraps or fonts load.
 const positionBridge = () => {
  const panel = scene.querySelector('.ap-infrastructure');
  scene.style.setProperty('--ap-bridge-top', `${panel.offsetHeight + 31}px`);
 };
 new ResizeObserver(positionBridge).observe(scene.querySelector('.ap-infrastructure'));
 positionBridge();
})();


(()=>{const root=document.querySelector(".hotel-catalog-hero"),nav=document.querySelector("body>.top");if(!root||!nav)return;const fit=()=>{const r=nav.getBoundingClientRect();root.style.setProperty("--hc-nav-clearance",Math.max(130,r.height+Math.max(0,r.top)+28)+"px")};fit();new ResizeObserver(fit).observe(nav);window.addEventListener("resize",fit,{passive:true})})();

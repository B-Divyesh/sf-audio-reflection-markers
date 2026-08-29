import './styles.css';

const heading = document.querySelector('h1') as HTMLElement | null;
const routeStatus = document.querySelector('.route-status') as HTMLElement | null;

function focusRouteHeading(): void {
  if (!heading) return;
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  if (routeStatus) routeStatus.textContent = `${document.title} opened.`;
}

if (heading) focusRouteHeading();

const menuToggle = document.querySelector<HTMLButtonElement>('#menu-toggle');
const headerNav = document.querySelector<HTMLElement>('#product-nav');
menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  headerNav?.classList.toggle('is-open', open);
});
headerNav?.addEventListener('click', () => {
  menuToggle?.setAttribute('aria-expanded', 'false');
  headerNav.classList.remove('is-open');
});
window.addEventListener('pageshow', (event) => { if (event.persisted) focusRouteHeading(); });

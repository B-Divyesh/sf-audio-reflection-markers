import './styles.css';

const heading = document.querySelector('h1') as HTMLElement | null;
if (heading) {
  heading.tabIndex = -1;
  heading.focus();
}

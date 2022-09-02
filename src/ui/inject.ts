import style from '@/style/index.css?inline';

/** Inject Css style to the page */
export const inject_css = () => {
  const styleSheet = document.createElement('style');
  styleSheet.setAttribute('type', 'text/css');
  styleSheet.innerText = style;
  document.head.appendChild(styleSheet);
};

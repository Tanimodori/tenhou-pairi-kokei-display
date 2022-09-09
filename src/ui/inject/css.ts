import style from '@/style/index.less?inline';

/** Inject Css style to the page */
export const inject_css = () => {
  const styleSheet = document.createElement('style');
  styleSheet.setAttribute('type', 'text/css');
  styleSheet.innerHTML = style;
  document.head.appendChild(styleSheet);
};

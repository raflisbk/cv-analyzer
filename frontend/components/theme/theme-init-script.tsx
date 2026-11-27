import { THEME_COOKIE } from "./theme-cookie";

const SCRIPT = `(function(){try{var d=document.documentElement;if(document.cookie.indexOf("${THEME_COOKIE}=")===-1&&window.matchMedia("(prefers-color-scheme: dark)").matches){d.dataset.theme="dark";d.style.colorScheme="dark";var m=document.querySelector('meta[name="color-scheme"]');if(m)m.setAttribute("content","dark")}}catch(e){}})()`;

export function ThemeInitScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}

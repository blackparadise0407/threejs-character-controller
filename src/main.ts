import { Application } from "./app/Application";
import "./style.css";

let app: Application | undefined;

window.addEventListener("DOMContentLoaded", () => {
  app = new Application();
});

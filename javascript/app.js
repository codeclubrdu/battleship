import { SingleGame, CpuGame } from "./game.js";
/**
 * Looks up an element by id, throwing if it does not exist.
 * @param {string} id - The element's id attribute.
 * @returns {Element}
 */
function getEl(id) {
   const element = document.getElementById(id);
   if(element instanceof Element) {
      return element;
   } else {
      throw(`Element with ID of ${id} does not exist`);
   }
}

/**
 * Returns the first element matching a CSS selector, throwing if none match.
 * @param {string} className - CSS selector (e.g. ".mode-select-container").
 * @returns {Element}
 */
function selectFirst(className) {
   const element = document.querySelector(className);
   if (element instanceof Element) {
      return element;
   } else {
      throw(`Element with class of ${className} does not exist`); 
   }
}

const singleModeSelect = getEl("singleMode");
const vsCpuModeSelect = getEl("vsCpu");
const modeSelectContainer = selectFirst(".mode-select-container");
const gameBoard = getEl("gameboard");
const infoContainer = getEl("infoContainer");


/**
 * Top-level controller: wires up the mode-select menu and starts games.
 */
class App {

   constructor() {
      this.initModeSelector({ mode: "vsCpu" });
      this.initModeSelector({ mode: "single" });
   }

   /**
    * Wires one mode button to its settings form; submitting the form starts that game mode.
    * @param {object} params
    * @param {"single"|"vsCpu"} params.mode - Which mode button/form pair to wire up.
    */
   initModeSelector( { mode }) {
      const modeSelect = (mode === "vsCpu") ? vsCpuModeSelect : singleModeSelect;
      modeSelect.addEventListener("click", (e) => {
         e.preventDefault();
         modeSelectContainer.classList.add("hide");

         const formController = new AbortController();
         const form = document.getElementById(mode + "ModeForm");
         form.classList.remove("hide");
         form.addEventListener("submit", (e) => {
            e.preventDefault();
            if (e.target instanceof HTMLFormElement) {
               const formData = Object.fromEntries(new FormData(e.target));
               form.classList.add("hide"); 
               document.getElementById("backBtn").classList.add("hide");
               formController.abort();
               backBtnController.abort();
               if (mode === "vsCpu") {
                  new CpuGame({ app: this, difficulty: String(formData.difficulty), gameBoard });
               } else {
                  new SingleGame({ app: this, difficulty: String(formData.difficulty), gameBoard });
               }
            } else {
               throw("Element is not Form Element");
            }
            
         }, { signal: formController.signal });
         
         const backBtnController = new AbortController();
         const backBtn = document.getElementById("backBtn");
         backBtn.classList.remove("hide");
         backBtn.addEventListener("click", (e) => {
            e.preventDefault();
            form.classList.add("hide");
            formController.abort();
            gameBoard.innerHTML = "";
            this.goBackToMainMenu();
            backBtn.classList.add("hide");
            backBtnController.abort();
         }, { signal: backBtnController.signal });
      });
   }

   /**
    * Clears the board and info bar and shows the mode-select menu again.
    */
   goBackToMainMenu() {
      gameBoard.innerHTML = "";
      modeSelectContainer.classList.remove("hide");
      const infoElements = infoContainer.querySelectorAll("div");
      infoElements.forEach((e) => e.innerHTML = "");
   } 

}

new App();

export { App };
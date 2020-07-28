/**
 * @packageDocumentation
 * @ignore
 */
import * as dat from "dat.gui";
import * as MP from "@bandaloo/merge-pass";
import * as A from "./exampleanimations";
import { foggyrays, FoggyRaysExpr } from "./src/foggyrays";

const slow = false;

const glCanvas = document.getElementById("gl") as HTMLCanvasElement;
const gl = glCanvas.getContext("webgl2");

const mousePos = { x: 0, y: 0 };

if (gl === null) {
  throw new Error("problem getting the gl context");
}

const sourceCanvas = document.getElementById("source") as HTMLCanvasElement;
const source = sourceCanvas.getContext("2d");

if (source === null) {
  throw new Error("problem getting the source context");
}

function getVariable(variable: string) {
  let query = window.location.search.substring(1);
  let vars = query.split("&");

  for (var i = 0; i < vars.length; i++) {
    let pair = vars[i].split("=");
    if (pair[0] == variable) return pair[1];
  }
}

interface Demo {
  merger: MP.Merger;
  change: (merger: MP.Merger, time: number, frame: number) => void;
}

interface Demos {
  [name: string]: (channels?: TexImageSource[]) => Demo;
}

const demos: Demos = {
  foggyrays: (channels: TexImageSource[] = []) => {
    let fg: FoggyRaysExpr;
    const merger = new MP.Merger([(fg = foggyrays())], sourceCanvas, gl, {
      channels: channels,
    });

    class BlurControls {
      period = 100;
      speed = 1;
      throwDistance = 0.3;
    }

    const controls = new BlurControls();
    const gui = new dat.GUI();
    gui.add(controls, "period", 10, 300);
    gui.add(controls, "speed", 0.2, 30, 0.1);
    gui.add(controls, "throwDistance", 0.1, 1, 0.01);

    return {
      merger: merger,
      change: () => {
        fg.setPeriod(controls.period);
        fg.setSpeed(controls.speed);
        fg.setThrowDistance(controls.throwDistance);
      },
    };
  },
};

interface Draws {
  [name: string]: ((
    time: number,
    frames: number,
    x: CanvasRenderingContext2D,
    c: HTMLCanvasElement
  ) => void)[];
}

// canvas drawing loops

const draws: Draws = {
  foggyrays: [A.higherOrderDonuts(true), A.higherOrderDonuts(false)],
};

interface Notes {
  [name: string]: string;
}

const notes: Notes = {
  foggyrays: "this is a test <code>test</code>",
};

const canvases = [sourceCanvas];
const contexts = [source];

let demo: Demo;
let key: string;

window.addEventListener("load", () => {
  MP.settings.verbosity = 1;
  MP.settings.offset = 3;
  console.log("offset", MP.settings.offset);
  let mstr = getVariable("m");
  let dstr = getVariable("d");

  if (mstr === undefined || demos[mstr] === undefined) mstr = "foggyrays";
  if (dstr === undefined || draws[dstr] === undefined) dstr = mstr;
  const draw = draws[dstr];
  if (draw === undefined) throw new Error("draw not found");

  const note = notes[mstr];
  if (note !== undefined) {
    const div = document.getElementById("note");
    const title = document.createElement("h2");
    const p = document.createElement("p");
    title.innerText = "note";
    p.innerHTML = note;
    if (div === null) throw new Error("notes div was undefined");
    div.appendChild(title);
    div.appendChild(p);
  }

  // minus 1 because we already included the source canvas and context
  for (let i = 0; i < draw.length - 1; i++) {
    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 540;
    const context = canvas.getContext("2d");
    if (context === null) {
      throw new Error("couldn't get the context of the canvas");
    }
    canvases.push(canvas);
    contexts.push(context);
    const header = document.createElement("h3");
    header.innerText = "channel " + i;
    document.getElementById("buffers")?.appendChild(header);
    document.getElementById("buffers")?.appendChild(canvas);
  }

  key = mstr;
  demo = demos[key](canvases.slice(1));
  if (demo === undefined) throw new Error("merger not found");

  (document.getElementById("title") as HTMLElement).innerText =
    "merge-pass demo: " + mstr;

  // unindent code string
  // only replace leading spaces with nbsp
  let codeStr = (" ".repeat(4) + demos[mstr])
    .split("\n")
    .map((l) => l.substr(4))
    .join("\n")
    .replace(/ /g, "&nbsp");

  const codeElem = document.getElementById("mergercode") as HTMLElement;

  const reg = /Merger([\s\S]*?);/g;
  const matches = codeStr.match(reg);

  if (matches === null) throw new Error("matches was null");
  codeElem.innerHTML = codeStr.replace(reg, "<em>" + matches[0] + "</em>");

  // add links
  const demoNames = Object.keys(demos);

  const urls = demoNames.map(
    (d) => window.location.href.split("?")[0] + "?m=" + d
  );

  (document.getElementById("link") as HTMLAnchorElement).href =
    urls[Math.floor(Math.random() * urls.length)];

  const p = document.getElementById("demos") as HTMLParagraphElement;

  let counter = 0;
  for (const u of urls) {
    const demoLink = document.createElement("a");
    demoLink.href = u;
    demoLink.innerText = demoNames[counter];
    p.appendChild(demoLink);
    p.innerHTML += " ";
    counter++;
  }

  let frame = 0;
  const step = (t = 0) => {
    let counter = 0;
    for (const d of draw) {
      d(t / 1000, frame, contexts[counter], canvases[counter]);
      counter++;
    }
    demo.change(demo.merger, t, frame);
    demo.merger.draw(t / 1000, mousePos.x, mousePos.y);
    !slow ? requestAnimationFrame(step) : setTimeout(step, 1000);
    frame++;
  };

  step(0);
});

glCanvas.addEventListener("click", () => glCanvas.requestFullscreen());
glCanvas.addEventListener("mousemove", (e) => {
  const rect = glCanvas.getBoundingClientRect();
  mousePos.x = (960 * (e.clientX - rect.left)) / rect.width;
  mousePos.y = (540 * (rect.height - (e.clientY - rect.top))) / rect.height;
});
sourceCanvas.addEventListener("click", () => sourceCanvas.requestFullscreen());

/**
 * @packageDocumentation
 * @ignore
 */
import * as MP from "@bandaloo/merge-pass";
import * as dat from "dat.gui";
import * as A from "./exampleanimations";
import { foggyrays, FoggyRaysExpr } from "./foggyrays";
import { vignette, Vignette } from "./vignette";
import { Merger } from "@bandaloo/merge-pass";
import { BlurAndTrace } from "./blurandtrace";

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

  vignette: () => {
    let v: Vignette;
    const merger = new MP.Merger([(v = vignette())], sourceCanvas, gl);

    class VignetteControls {
      blur = 3;
      brightness = 1.8;
      exponent = 1.8;
    }

    const controls = new VignetteControls();
    const gui = new dat.GUI();
    gui.add(controls, "blur", 1, 6, 0.01);
    gui.add(controls, "brightness", 0.5, 5, 0.01);
    gui.add(controls, "exponent", 0.5, 4, 0.01);

    return {
      merger: merger,
      change: () => {
        v.setBlurScalar(controls.blur);
        v.setBrightnessScalar(controls.brightness);
        v.setBrightnessExponent(controls.exponent);
      },
    };
  },

  blurandtracescene: () => {
    let bt: BlurAndTrace;
    const merger = new Merger([(bt = new BlurAndTrace())], sourceCanvas, gl, {
      channels: [null],
    });

    class BlurAndTraceControls {
      brightness = 1;
      blur = 1;
    }

    const controls = new BlurAndTraceControls();
    const gui = new dat.GUI();
    gui.add(controls, "brightness", -1, 1, 0.01);
    gui.add(controls, "blur", 0, 2, 0.01);

    return {
      merger: merger,
      change: () => {
        bt.setBlurSize(controls.blur);
        bt.setBrightness(controls.brightness);
      },
    };
  },

  blurandtracedepth: (channels: TexImageSource[] = []) => {
    let bt: BlurAndTrace;
    const merger = new Merger(
      [(bt = new BlurAndTrace(MP.mut(1), MP.mut(1), 4, 13, 0, true))],
      sourceCanvas,
      gl,
      { channels: channels }
    );

    class BlurAndTraceControls {
      brightness = 1;
      blur = 1;
    }

    const controls = new BlurAndTraceControls();
    const gui = new dat.GUI();
    gui.add(controls, "brightness", -1, 1, 0.01);
    gui.add(controls, "blur", 0, 2, 0.01);

    return {
      merger: merger,
      change: () => {
        bt.setBlurSize(controls.blur);
        bt.setBrightness(controls.brightness);
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

const draws: Draws = {
  foggyrays: [A.higherOrderDonuts(true), A.higherOrderDonuts(false)],
  vignette: [A.redSpiral],
  blurandtracescene: [A.higherOrderPerspective(true)],
  blurandtracedepth: [
    A.higherOrderPerspective(true),
    A.higherOrderPerspective(false),
  ],
};

interface Notes {
  [name: string]: string;
}

const notes: Notes = {
  foggyrays:
    "this adds some texture to the effect you would normally get with <code>godrays</code>",
  vignette: "this effect blurs and darkens the edges",
  blurandtracescene:
    "this effect blurs the scene and traces back over it with lines. you need to supply a " +
    "<code>null</code> scratch texture for this method. by default <blurandtrace> looks for " +
    "this texture in channel 0 (see <code>channels</code> in the code below)",
  blurandtracedepth:
    "you can use <code>blurandtrace</code> with the depth buffer to get an even " +
    "better effect compared to only using the scene buffer. the lines will naturally get " +
    "lighter in the distance with this method. set the final argument of <code>blurandtrace</code> " +
    "to true",
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

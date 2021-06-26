function createUml(spec) {
  return `https://g.gravizo.com/svg?
  @startuml;
  skinparam monochrome true;
  skinparam backgroundColor none;
  skinparam classBackgroundColor darkslategrey;
  skinparam classBorderColor gray;
  skinparam classFontColor lightgray;
  skinparam classStereotypeFontColor darkgray;
  skinparam arrowColor lightgray;
  skinparam linetype ortho;
  ${spec}
  @enduml;`;
}

function createDigraph(spec) {
  return `https://g.gravizo.com/svg?
  digraph G {
  ${spec}
  }`;
}

function normalize(value) {
  return value.replaceAll('<', '%3C').replaceAll('>', '%3E');
}

function setUmlGraph(tag, spec) {
  const element = document.getElementById(tag);
  const graph = createUml(normalize(spec));
  console.log(normalize(spec));
  element.src = graph;
}

function setDigraph(tag, spec) {
  const element = document.getElementById(tag);
  const graph = createDigraph(normalize(spec));
  element.src = graph;
}

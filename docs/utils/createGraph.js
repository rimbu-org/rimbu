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

function normalize(value) {
  return value.replaceAll('<', '%3C').replaceAll('>', '%3E');
}

function setUmlGraph(tag, spec) {
  const element = document.getElementById(tag);
  const graph = createUml(normalize(spec));
  element.src = graph;
}

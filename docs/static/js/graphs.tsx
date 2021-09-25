import React from "react";

function createUml(spec: string): string {
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

function createDigraph(spec: string): string {
  return `https://g.gravizo.com/svg?
  digraph G {
  ${spec}
  }`;
}

function normalize(value: string): string {
  return value.replaceAll("<", "%3C").replaceAll(">", "%3E");
}

export function UmlGraph(props: { contents: string }) {
  const src = normalize(createUml(props.contents));

  return <img src={src} className="diagram" />;
}

export function DiGraph(props: { contents: string }) {
  const src = normalize(createDigraph(props.contents));

  return <img src={src} className="diagram" />;
}

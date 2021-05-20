import { Arr } from '@rimbu/base';
import { Stream } from '@rimbu/core';
import b from 'benny';

const arr = Stream.range({ amount: 256 }).toArray();

function process(_: number, index: number, halt: () => void) {
  if (index > 200) halt();
}

function mapFun(value: number, index: number) {
  return value + index;
}

b.suite(
  'Arr',

  b.add('append', () => {
    Arr.append(arr, -1);
  }),

  b.add('concat', () => {
    Arr.concat(arr, arr);
  }),

  b.add('copySparse', () => {
    Arr.copySparse(arr);
  }),

  b.add('forEach', () => {
    Arr.forEach(arr, process);
  }),

  b.add('forEach reverse', () => {
    Arr.forEach(arr, process, undefined, true);
  }),

  b.add('init', () => {
    Arr.init(arr);
  }),

  b.add('insert', () => {
    Arr.insert(arr, 100, -1);
  }),

  b.add.skip('last', () => {
    Arr.last(arr);
  }),

  b.add('map', () => {
    Arr.map(arr, mapFun);
  }),

  b.add('mapSparse', () => {
    Arr.mapSparse(arr, mapFun);
  }),

  b.add('mod', () => {
    Arr.mod(arr, 100, (v) => v + 1);
  }),

  b.add('prepend', () => {
    Arr.prepend(arr, -1);
  }),

  b.add('reverse', () => {
    Arr.reverse(arr);
  }),

  b.add('reverseMap', () => {
    Arr.reverseMap(arr, mapFun);
  }),

  b.add('splice', () => {
    Arr.splice(arr, 100, 50, -1);
  }),

  b.add('tail', () => {
    Arr.tail(arr);
  }),

  b.add('update', () => {
    Arr.update(arr, 100, (v) => v + 1);
  }),

  b.cycle(),
  b.complete(),
  b.save({ file: 'Arr', version: '1.0.0' }),
  b.save({ file: 'Arr', format: 'chart.html' })
);

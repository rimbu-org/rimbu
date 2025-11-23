/**
 * @packageDocumentation
 *
 * The `@rimbu/actor/patch` entry provides utilities for patch‑style state updates in
 * `@rimbu/actor`, letting you update only parts of the actor state using concise patch
 * objects and updater functions.<br/>
 * Use it when you want ergonomic, fine‑grained state changes on actors without manually
 * cloning or reconstructing full state objects.
 */

export * from './slice-patch.ts';

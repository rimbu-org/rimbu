# Rimbu `@example` Authoring Guidelines

Guidelines for writing (or rewriting) the `@example` blocks in Rimbu's JSDoc.
These are written to be followed **autonomously by agents**, so the rules are
mechanical wherever possible. When a rule says "MUST", treat deviations as bugs.

The goal: examples that are **concise, meaningful, insightful**, that clearly
demonstrate the benefit of each member, and that reflect real-life use cases
where possible. Agents are free to **replace an existing example entirely** with
a better one.

> Companion tooling: the examples gate type-checks every snippet, and a
> run-and-capture step executes each snippet against the built `dist` to fill and
> verify the output comments (`// =>`) and the inferred-type comments
> (`// inferred type:`). Because of this, **outputs are correct-by-construction —
> never hand-write them** (see §6).

---

## 1. Where examples live

Rimbu's concrete collections (`HashMap`, `SortedMap`, `HashSet`, `CharList`,
`BitList`, every graph/table/multimap variant, …) are **empty HKT interfaces**:
they declare no members of their own and inherit everything from an abstract
base (`RMapBase`, `RSetBase`, `ListBase`, `RStream`, …). ~63% of all documented
members are inherited this way.

Consequences you MUST follow:

1. **Author examples on the base interface where the member is declared**, not on
   the concrete sub-interface. There is usually no declaration site on the
   concrete type to attach to, and adding one would force repeating the entire
   member (overloads included) — which is disallowed.
2. The base interface has **no concrete implementation**, so an example MUST pick
   a concrete implementation to instantiate (e.g. `HashMap`, `SortedMap`,
   `List`). This is expected and encouraged (see §4).
3. **Do not** create example-override files, `@impl`-style tags, or per-child
   example machinery. None exists; do not invent it.

### 1a. Accepted limitation (do not try to "fix" it)

Because a base example is inherited verbatim, a sub-interface page may show an
example that uses a *sibling's* concrete type (e.g. an inherited `filter`
example on the `CharList` page may show `List`). **This is a consciously accepted
trade-off.** Do not attempt to special-case it.

### 1b. One example per member

- Write **one** `@example` per member, attached to the member's **first
  signature** (this matches TypeDoc, which documents the first signature).
- The single example SHOULD cover **all overloads of that member within the
  current interface** — pick data that exercises the meaningful overloads.
- Only demonstrate overloads inherited from a *base* interface when there is
  **real added value**. Otherwise let the reader navigate to the base. Do not
  repeat docs/examples across overloads.

---

## 2. Two kinds of examples (different guidance)

### 2a. Entity / type-level examples

Attached to the interface/type itself (e.g. the `List` interface's own
`@example`). These SHOULD be a **broad, real-world showcase** of what the type is
for — a short narrative that shows the type solving a believable problem.

### 2b. Member-level examples

Attached to a method or property. These MUST **isolate that one member's
benefit**. Do **not** open with an elaborate real-world scenario that buries the
member being demonstrated — set up the minimum needed, then show the member and
its result.

---

## 3. Imports

- Every example is a **self-contained, runnable program**: it MUST include its
  own `import` statements.
- Import each named entity **from the specific package that exports it**
  (`@rimbu/list`, `@rimbu/hashed`, `@rimbu/sorted`, `@rimbu/stream`, …). **Do
  NOT** import from the `@rimbu/core` umbrella.
- A single example MAY import from **multiple** `@rimbu/*` packages (e.g. a base
  `collection-types` example importing `HashMap` from `@rimbu/hashed` and
  `Stream` from `@rimbu/stream`). This is fully supported by the gate.
- Only import what the example uses.

```ts
import { List } from '@rimbu/list';
import { Stream } from '@rimbu/stream';
```

---

## 4. Choosing the concrete implementation

- Base examples MUST instantiate a concrete implementation. **Variety is
  encouraged** — it makes readers aware of the available implementations. You do
  **not** have to always pick the same one.
- When a member's **behavior differs across implementations**, you MAY use
  **multiple concrete implementations in the same example** to highlight the
  difference.
- See §6a for the important determinism rule when the output is order-sensitive.

---

## 5. Style

- **Concise, meaningful, insightful.** Prefer a real-life use case. Every example
  should make the member's value obvious.
- **Descriptive variable names.** Because collections are immutable, functional
  updates commonly produce a chain of `const`s — name each for its role:

  ```ts
  const initialList = List.of(1, 2, 3);
  const updatedList = initialList.append(4);
  ```

  Avoid `l1`, `l2`, `x`, `tmp`.
- **Do NOT add explicit type annotations.** A key strength of Rimbu is advanced
  **type inference**; annotating everything gives the wrong impression that users
  must. Let inference do the work.
- **Size budget:** aim for **≤ 8 lines including imports**; hard maximum **~15**.
  Multi-statement setup is allowed, but in most cases a factory (`X.of(...)`,
  `X.from(...)`) keeps it tight — prefer that.

### 5a. The `// inferred type:` comment (rare, verifiable)

Use sparingly. Add a `// inferred type: <Type>` comment at the end of a line
**only when the inference is genuinely surprising**, specifically:

1. The result type is **overload/argument dependent** — e.g. `RMapBase`'s
   `updateAtAndGet` returns a tuple whose first element is the **NonEmpty** map
   type when the update applies but the normal map type otherwise.
2. The inference **narrows in a non-obvious way** — e.g.:

   ```ts
   const numbers = List.of(1, 2, 3); // inferred type: List.NonEmpty<number>
   ```

   (`List.of(...)` yields `List.NonEmpty<number>`, not `List<number>` — this is
   surprising and worth documenting.)

Do **NOT** annotate obvious narrowing (e.g. `.append()` returning a `.NonEmpty`
type is expected — skip it).

This comment is **verified** by tooling against the compiler's actual inferred
type, so it MUST be accurate. If unsure, run/check it — do not guess.

---

## 6. Final output & the `// =>` output comment

- The final statement of an example SHOULD be a `console.log(...)` that produces
  **meaningful** output.
- **Simple return values** (number, string, boolean) are logged directly:
  `console.log(list.size)`.
- **Collection return values** MUST be logged via `.toString()`:
  `console.log(updatedList.toString())`. Most collections have a good
  `.toString()`.
- **Never log `undefined`.** For void / mutating members (e.g. a Builder's
  `.add()` that returns `void`), log something meaningful instead: the new
  builder size, the built collection via `.toString()`, or a value read back
  from the builder.

  ```ts
  // Bad:  console.log(builder.add(5))            // => undefined
  // Good: builder.add(5); console.log(builder.size)
  ```

### 6a. Output correctness & determinism

- **Outputs are run-and-captured, never hand-written.** The tooling executes each
  snippet **with Bun** and fills/verifies the `// =>` comment from real stdout. Do
  not invent output by reasoning about it. (The live in-browser Sandpack console
  may format non-string values, e.g. arrays/objects, slightly differently from
  Bun — that minor drift is accepted. If you want output that is identical
  everywhere, log strings: `.toString()`, template strings, or `JSON.stringify`.)
- **Hashed collections have non-obvious, potentially unstable iteration order**
  (their `.toString()` renders in that order). When the point of the example is
  **not** the hashing, prefer a **deterministic** implementation
  (`SortedMap`/`SortedSet`) or a deterministic accessor (`.get(...)`, `.size`,
  `.toArray().sort()`) so the output is stable and readable. Use hashed
  collections when hashing *is* the subject — but their output MUST come from an
  actual run.
- **Forbidden: non-deterministic / environment-dependent output.** Do not write
  examples whose output depends on timestamps, randomness, `Date`, locale, etc.
  If a member inherently involves these, keep the logged output to a
  deterministic, verifiable part.
- **Bun formatting of non-string values.** When you log a raw array/object (not a
  string), the captured output uses **Bun's** `console.log` formatting, which
  differs from source/Node style: arrays render with inner spaces and strings use
  double quotes — e.g. `console.log(['a', 'b'])` captures as `[ "a", "b" ]`, and
  `console.log([1, 2, 3])` captures as `[ 1, 2, 3 ]`. Write the `// =>` exactly as
  Bun emits it (the verify tool prints the exact expected value on mismatch). To
  avoid this entirely, log a string (`.toString()`, template string,
  `JSON.stringify`).

### 6b. Format of the `// =>` comment

Every `console.log(...)` MUST carry its own output comment, placed **adjacent to
that log** and appearing in **stdout order**. There are two forms, chosen by
length:

**Inline** — when the whole resulting line is **≤ 80 characters** (threshold is
configurable in tooling; use 80 by default):

```ts
console.log(updatedList.toString()); // => List(1, 2, 3, 4)
```

**Next-line, single-line output** — when the output is one line but the whole
`console.log(...) // => ...` would exceed 80 characters. Put a single `// =>`
line directly below the log, one space after `// =>`:

```ts
console.log(bigMap.toString());
// => SortedMap(alpha -> 1, beta -> 2, gamma -> 3, delta -> 4, epsilon -> 5)
```

**Next-line, multi-line output** — when the output itself spans multiple lines.
Put an **empty `// =>` marker** at the end of the `console.log` line, then the
output as a contiguous `//` block below it. Do not repeat `=>` on the content
lines. Each output line is a plain `//` with exactly **one space** after it:

```ts
console.log(tree.toString()); // =>
// Node(root)
//   Node(left)
//   Node(right)
```

Rules for the parser/verifier (keep these exact):

- **Inline** (`console.log(...); // => X`): expected output is the text after
  `// => `.
- **Next-line, single-line** (`// => X` on the line below): expected output is the
  text after `// => ` on that one line.
- **Multi-line** (trailing empty `// =>` on the `console.log` line): expected
  output is the block of contiguous `//` comment lines **immediately following**
  the `console.log` statement, each with a single leading space stripped, joined
  by newlines. The block ends at the first non-`//` line (blank line, next
  statement, etc.).
- The trailing empty `// =>` is the unambiguous signal that a multi-line output
  block follows — the parser never has to guess whether a `//` block is output or
  an ordinary comment.
- **Match is exact (byte-for-byte)** against captured stdout. Do not normalize
  whitespace or quote style yourself — the tooling writes the exact string.
- Each `console.log` gets exactly one output comment (inline, next-line, or
  multi-line).

### 6c. Parser pitfalls (from the List pilot — avoid these)

- **Keep `console.log(...)` on one physical line.** The verifier pairs a
  `console.log` with the `// =>` on the **same line** (or the line immediately
  below). If a call spans multiple lines (e.g. a multi-line arrow argument with the
  chained `.toString()); // =>` on the closing line), the comment is orphaned and
  reported as "missing". Fix: assign the result to a `const`, then log it on a
  single line:

  ```ts
  const halted = list.collect((v, i, skip, halt) => {
    if (v > 1) halt();
    return v * 2;
  });
  console.log(halted.toString()); // => List(0, 2, 4)
  ```

- **Don't log inside a loop body.** A single `console.log` inside `forEach`/`for`
  fires once per element but parses as one statement, producing a "captured N logs
  but only 1 console.log parsed" mismatch. Collect into an array and log once:

  ```ts
  const collected: number[] = [];
  list.forEach((value, i, halt) => {
    collected.push(value * 2);
    if (i >= 1) halt();
  });
  console.log(collected); // => [ 0, 2 ]
  ```

- **Let type-checking correct the API usage, not just the output.** The gate
  rejects examples that mis-use overloads: e.g. a fallback argument
  (`.first('x')`) is not allowed on a value known non-empty (`List.of(...)`); use a
  possibly-empty, explicitly-typed source (`const l: List<number> = List.empty()`).
  Prefer the exact signature the example is attached to.

### 6d. Output-format realities (captured from the List + collection-types pilots)

The verifier executes examples with **Bun** and formats every non-string argument
via `Bun.inspect(arg, { breakLength: Infinity, compact: true })`, so output is
**single-line, deterministic, and width-independent** (you don't need multi-line
`// =>` blocks for arrays/objects — they render on one line). The captured text is
what you paste after `// =>`. Known behaviors to expect:

- **Strings logged as a top-level `console.log(arg)` argument are printed
  UNQUOTED.** `console.log('b')` captures `b`, not `"b"`. Only strings *inside* an
  array/object are quoted. So `.get(2)` → `b`, `.typeTag` → `HashMap`, builder
  `.updateAt(k, () => 'a')` → `a`. If you want to show a quoted string, log it inside
  an array, e.g. `console.log([res])`.
- **`HashMap`/`RMap.toString()` uses `->`, not `=>`.** `HashMap.of([1,'a'],[2,'b'])`
  is `HashMap(1 -> a, 2 -> b)`. Don't write `HashMap(1 => a, 2 => b)`.
- **HashSet / SortedSet ordering is NOT insertion order** for hashed sets (and
  `flatMap`/`transform` results are likewise unordered). Never assume a specific
  order; if order matters for the demonstrated output, use `List` instead, or accept
  whatever the runtime yields.
- **`HashSet.toJSON()` (and similar) currently serializes with an EMPTY `value`
  array** — `{ dataType: "HashSet", value: [] }`. This is a real (surprising) API
  behavior; capture it as-is rather than guessing the elements.
- **`modifyAt` uses the brace form** `{ ifNew: { set } | { create } }` and
  `{ ifExists: { set } | { update } }` — never a bare value or a bare function.
  (This is an API that changed since older examples were written; the gate will
  reject the old shape.)
- **`transform`/`map`-style callbacks that build tuple results must annotate the
  return type** as a tuple, or TS widens `[k, v.toUpperCase()]` to
  `(string | number)[]` and the overload won't match. Write
  `s.map(([k, v]): [number, string] => [k, v.toUpperCase()])`.

---

## 7. Checklist (per example)

- [ ] Attached to the member's **first signature** (or the entity, for
      type-level examples).
- [ ] Self-contained: has its own `import`s, from the **specific** packages.
- [ ] Instantiates a concrete implementation; variety encouraged.
- [ ] No explicit type annotations; `// inferred type:` only where genuinely
      surprising (and accurate).
- [ ] Descriptive variable names (`initialX` / `updatedX`, not `x1`/`x2`).
- [ ] ≤ 8 lines (hard max ~15); factories preferred over long setup.
- [ ] Ends in a meaningful `console.log`; collections via `.toString()`; never
      logs `undefined`.
- [ ] Deterministic, verifiable output; hashed/order-sensitive output only from a
      real run; no timestamps/random/`Date`.
- [ ] Every `console.log` has an adjacent output comment — inline `// =>` (≤ 80
      chars), `// =>` on the next line (single-line output), or a trailing empty
      `// =>` followed by a plain `//` block (multi-line output) — in stdout
      order, exact-match.
- [ ] Type-checks (examples gate passes).

---

## 8. Worked examples

### Member-level, simple output, inline comment

```ts
import { List } from '@rimbu/list';

const numbers = List.of(1, 2, 3); // inferred type: List.NonEmpty<number>
const updatedNumbers = numbers.append(4);
console.log(updatedNumbers.toString()); // => List(1, 2, 3, 4)
```

### Member-level, deterministic collection chosen for stable output

```ts
import { SortedMap } from '@rimbu/sorted';

const initialScores = SortedMap.of(['alice', 3], ['bob', 5]);
const updatedScores = initialScores.set('carol', 4);
console.log(updatedScores.toString()); // => SortedMap(alice -> 3, bob -> 5, carol -> 4)
```

### Member-level, overload-dependent inferred type + multiple logs

```ts
import { HashMap } from '@rimbu/hashed';

const inventory = HashMap.of([1, 'apple'], [2, 'pear']);
const [updated, previous, existed] = inventory.updateAtAndGet(2, (v) => v + 's');
console.log([updated.get(2), previous, existed]); // => [ "pears", "pear", true ]
```

> Note: `updateAtAndGet` is defined on `RMapBase` (maps). Its result tuple's
> first element is the `NonEmpty` map type when the update applies. Add an
> `// inferred type:` comment on the destructured binding only if it genuinely
> aids understanding.

### Builder (void-returning member) — log something meaningful

```ts
import { List } from '@rimbu/list';

const builder = List.builder<string>();
builder.append('a');
builder.append('b');
console.log(builder.build().toString()); // => List(a, b)
```

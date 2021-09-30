---
slug: how-it-got-started
title: How it all got started
author: Arvid Nicolaas
author_title: Rimbu Author
author_url: https://github.com/vitoke
author_image_url: https://github.com/vitoke.png
tags: [rimbu, scala, immutability, typescript]
---

In my Scala days, I became very interested in immutable collections, especially Scala's Vector. I was watching all kinds of YouTube videos from conferences
that discussed how it works, and why it offers reasonably fast random access (debatably called effectively constant time). At the same time, I discovered that the Vector did not have an `insert` or `remove`
method, and I wondered why. I started investigating how the data structure works, and read papers with proposals on how to improve the structure to allow random
insertion. I also started getting ideas on how it could be done differently and started implementing my own structure.

This was going slowly but I was progressing. And while I was doing that, I also found ways to have better typed methods for collections in Scala. I thought I might
as well create a whole collection library instead of just one collection implementation. I learned a lot from this effort about immutable data structures and
creating strict but useful types. However, after some time, I realized that Scala, while having a great compiler, was holding me back in writing the code I wanted
to write. Also, it seemed the community was getting split (due to a complete rewrite of Scala), and its popularity seemed to go down. In the meantime, Scala does have
a new Vector implementation with the `insert` and `remove` methods. I actually discovered this quite recently. However, I found the documentation of the structure lacking so I cannot compare it to my approach.

Since I was now using TypeScript at work, it seemed an interesting exercise to me to see if I could better write down my ideas in this language. It turned out
that this was indeed the case. And stil, I could create quite rich interfaces for the collection methods. This led me to abandon the Scala effort, and fully
focus on the TypeScript library (I basically ported/rewrote the Scala code to TypeScript). And now, I have (finally) released the Rimbu library.

There are many things still to be done, but I am satisfied with the library so far. I hope developers will find it useful for their own projects, and am
hopeful to hear what they think of it. I hope to find time to extensively document the data structure behind Rimbu's List in the near future. I find it quite
a remarkable data structure myself. I hope to write some blogs as well on interesting use cases I found for the various collections. Stay tuned!

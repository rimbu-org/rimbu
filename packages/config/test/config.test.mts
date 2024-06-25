import { Config, Cond } from '../src/index.mjs';

describe('Config.context no default', () => {
  const context = Config.context(['dev', 'prod']);

  it('get config keys', () => {
    const keys = context.keys;

    expect(keys).toEqual(['dev', 'prod']);
  });

  it('gets default key', () => {
    expect(context.defaultKey).toBeUndefined();
  });

  it('sets simple values', () => {
    const config = context.compile([{ dev: 'a', prod: 'b' }]);

    expect(config.dev).toBe('a');
    expect(config.prod).toBe('b');
  });

  it('sets simple interpolated values', () => {
    const config = context.compile((input: number) => [
      { dev: `a ${input}`, prod: `b ${input}` },
    ]);

    expect(config.dev(5)).toBe('a 5');
    expect(config.prod(4)).toBe('b 4');
  });

  it('sets nested values', () => {
    const config = context.compile({
      server1: [{ dev: 'a.com', prod: 'b.com' }],
      server2: (base: string) => [
        { dev: `a.com/${base}`, prod: `b.com/${base}` },
      ],
    });

    expect(config.dev.server1).toBe('a.com');
    expect(config.prod.server1).toBe('b.com');
    expect(config.dev.server2('b1')).toBe('a.com/b1');
    expect(config.prod.server2('b2')).toBe('b.com/b2');
  });

  it('sets deeply nested values', () => {
    const config = context.compile({
      a: {
        b: context.define({
          c: { d: { e: [{ dev: 'a', prod: 'b' }] } },
        }),
      },
    });

    expect(config.dev.a.b.c.d.e).toBe('a');
    expect(config.prod.a.b.c.d.e).toBe('b');
  });

  it('composes', () => {
    const part1 = context.define({
      a: [{ dev: 'a', prod: 'b' }],
    });
    const part2 = context.define({
      b: { c: [{ dev: 1, prod: 2 }] },
    });

    const config = context.compile({
      ...part1,
      ...part2,
    });

    expect(config.dev.a).toBe('a');
    expect(config.prod.a).toBe('b');
    expect(config.dev.b.c).toBe(1);
    expect(config.prod.b.c).toBe(2);
  });

  it('compileEnv can use other config', () => {
    const configPart1 = context.compile({
      a: [{ dev: 'part1dev', prod: 'part1prod' }],
    });

    const config = context.compileEnv(({ key }) => {
      const config1 = configPart1[key];

      return {
        b: [
          {
            dev: `part2dev-${config1.a}`,
            prod: `part2prod-${config1.a}`,
          },
        ],
      };
    });

    expect(config.dev.b).toBe('part2dev-part1dev');
    expect(config.prod.b).toBe('part2prod-part1prod');
  });
});

describe('Config.context with default', () => {
  const context = Config.context(['dev', 'prod'], { defaultKey: 'dev' });

  it('get context keys', () => {
    const keys = context.keys;

    expect(keys).toEqual(['dev', 'prod']);
  });

  it('gets default key', () => {
    expect(context.defaultKey).toBe('dev');
  });

  it('sets simple values', () => {
    {
      const config = context.compile([{ dev: 'a', prod: 'b' }]);

      expect(config.dev).toBe('a');
      expect(config.prod).toBe('b');
    }

    {
      const config = context.compile([{ dev: 'a' }]);

      expect(config.dev).toBe('a');
      expect(config.prod).toBe('a');
    }
  });

  it('sets simple interpolated values', () => {
    {
      const config = context.compile((input: number) => [
        { dev: `a ${input}`, prod: `b ${input}` },
      ]);

      expect(config.dev(5)).toBe('a 5');
      expect(config.prod(4)).toBe('b 4');
    }

    {
      const config = context.compile((input: number) => [
        { dev: `a ${input}` },
      ]);

      expect(config.dev(5)).toBe('a 5');
      expect(config.prod(4)).toBe('a 4');
    }
  });

  it('sets nested values', () => {
    {
      const config = context.compile({
        server1: [{ dev: 'a.com', prod: 'b.com' }],
        server2: (base: string) => [
          { dev: `a.com/${base}`, prod: `b.com/${base}` },
        ],
      });

      expect(config.dev.server1).toBe('a.com');
      expect(config.prod.server1).toBe('b.com');
      expect(config.dev.server2('b1')).toBe('a.com/b1');
      expect(config.prod.server2('b2')).toBe('b.com/b2');
    }

    {
      const config = context.compile({
        server1: [{ dev: 'a.com' }],
        server2: (base: string) => [{ dev: `a.com/${base}` }],
      });

      expect(config.dev.server1).toBe('a.com');
      expect(config.prod.server1).toBe('a.com');
      expect(config.dev.server2('b1')).toBe('a.com/b1');
      expect(config.prod.server2('b2')).toBe('a.com/b2');
    }
  });

  it('sets deeply nested values', () => {
    {
      const config = context.compile({
        a: {
          b: context.define({
            c: { d: { e: [{ dev: 'a', prod: 'b' }] } },
          }),
        },
      });

      expect(config.dev.a.b.c.d.e).toBe('a');
      expect(config.prod.a.b.c.d.e).toBe('b');
    }

    {
      const config = context.compile({
        a: {
          b: context.define({
            c: { d: { e: [{ dev: 'a' }] } },
          }),
        },
      });

      expect(config.dev.a.b.c.d.e).toBe('a');
      expect(config.prod.a.b.c.d.e).toBe('a');
    }
  });

  it('composes', () => {
    {
      const part1 = context.define({
        a: [{ dev: 'a', prod: 'b' }],
      });
      const part2 = context.define({
        b: { c: [{ dev: 1, prod: 2 }] },
      });

      const config = context.compile({
        ...part1,
        ...part2,
      });

      expect(config.dev.a).toBe('a');
      expect(config.prod.a).toBe('b');
      expect(config.dev.b.c).toBe(1);
      expect(config.prod.b.c).toBe(2);
    }

    {
      const part1 = context.define({
        a: [{ dev: 'a' }],
      });
      const part2 = context.define({
        b: { c: [{ dev: 1 }] },
      });

      const config = context.compile({
        ...part1,
        ...part2,
      });

      expect(config.dev.a).toBe('a');
      expect(config.prod.a).toBe('a');
      expect(config.dev.b.c).toBe(1);
      expect(config.prod.b.c).toBe(1);
    }
  });

  it('compileEnv can use other config', () => {
    {
      const configPart1 = context.compile({
        a: [{ dev: 'part1dev', prod: 'part1prod' }],
      });

      const config = context.compileEnv(({ key }) => {
        const config1 = configPart1[key];

        return {
          b: [
            {
              dev: `part2dev-${config1.a}`,
              prod: `part2prod-${config1.a}`,
            },
          ],
        };
      });

      expect(config.dev.b).toBe('part2dev-part1dev');
      expect(config.prod.b).toBe('part2prod-part1prod');
    }

    {
      const configPart1 = context.compile({
        a: [{ dev: 'part1dev' }],
      });

      const config = context.compileEnv(({ key }) => {
        const config1 = configPart1[key];

        return {
          b: [{ dev: `part2dev-${config1.a}` }],
        };
      });

      expect(config.dev.b).toBe('part2dev-part1dev');
      expect(config.prod.b).toBe('part2dev-part1dev');
    }
  });
});

describe('translation', () => {
  it('can be used for a demo', () => {
    // define the language and optional default language
    const context = Config.context(['en', 'nl'], { defaultKey: 'en' });

    // define a basic reusable config
    const basics = context.compile({
      count: Cond.matchInput((amount: number) => [
        [0, { en: 'zero', nl: 'nul' }],
        [1, { en: 'one', nl: 'één' }],
        [2, { en: 'two', nl: 'twee' }],
        [3, { en: 'three', nl: 'drie' }],
        [true, { en: `${amount}` }],
      ]),
    });

    // define another reusable config
    const inventory = context.compile({
      item: Cond.match(
        [1, { en: 'item', nl: 'artikel' }],
        [true, { en: 'items', nl: 'artikelen' }]
      ),
    });

    // create a config that uses the basic configs
    const screen1 = context.compileEnv(({ key }) => {
      const { count } = basics[key];
      const { item } = inventory[key];

      return {
        basketContents: [
          { en: 'Your basket contains:', nl: 'Uw mandje bevat:' },
        ],
        amountItems: (amount: number) => [
          {
            en: `${count(amount)} ${item(amount)}`,
          },
        ],
      };
    });

    function basketMessage(
      dict: Config.DictionaryType<typeof screen1>,
      amountItems: number
    ) {
      return `${dict.basketContents} ${dict.amountItems(amountItems)}`;
    }

    expect(basketMessage(screen1.en, 0)).toMatchInlineSnapshot(
      `"Your basket contains: zero items"`
    );
    expect(basketMessage(screen1.en, 1)).toMatchInlineSnapshot(
      `"Your basket contains: one item"`
    );
    expect(basketMessage(screen1.en, 2)).toMatchInlineSnapshot(
      `"Your basket contains: two items"`
    );
    expect(basketMessage(screen1.en, 3)).toMatchInlineSnapshot(
      `"Your basket contains: three items"`
    );
    expect(basketMessage(screen1.en, 4)).toMatchInlineSnapshot(
      `"Your basket contains: 4 items"`
    );
    expect(basketMessage(screen1.en, 5)).toMatchInlineSnapshot(
      `"Your basket contains: 5 items"`
    );

    expect(basketMessage(screen1.nl, 0)).toMatchInlineSnapshot(
      `"Uw mandje bevat: nul artikelen"`
    );
    expect(basketMessage(screen1.nl, 1)).toMatchInlineSnapshot(
      `"Uw mandje bevat: één artikel"`
    );
    expect(basketMessage(screen1.nl, 2)).toMatchInlineSnapshot(
      `"Uw mandje bevat: twee artikelen"`
    );
    expect(basketMessage(screen1.nl, 3)).toMatchInlineSnapshot(
      `"Uw mandje bevat: drie artikelen"`
    );
    expect(basketMessage(screen1.nl, 4)).toMatchInlineSnapshot(
      `"Uw mandje bevat: 4 artikelen"`
    );
    expect(basketMessage(screen1.nl, 5)).toMatchInlineSnapshot(
      `"Uw mandje bevat: 5 artikelen"`
    );
  });
});

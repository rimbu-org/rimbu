import { ApiPackage } from '~/json-model/index.ts';
import { wrap } from '~/utils.ts';

export async function loadPackage(dir: string, filename: string) {
  console.log(`reading ${dir}/${filename}`);
  let [rootPackage, subPackageBase] = filename.split('!', 2);
  let subPackage: string | undefined;
  if (subPackageBase) {
    subPackage = subPackageBase.split('.')[0];
  } else {
    rootPackage = rootPackage.split('.')[0];
  }

  const apiPackage = JSON.parse(
    await Deno.readTextFile(`${dir}/${filename}`)
  ) as ApiPackage;

  const id = `@rimbu/${rootPackage}${wrap(subPackage, '$', '')}!`;
  const name = `@rimbu/${rootPackage}${wrap(subPackage, '/', '')}`;

  return {
    kind: 'package',
    id,
    name,
    rootPackage,
    subPackage,
    apiPackage,
  };
}

export type LoadedPackage = Awaited<ReturnType<typeof loadPackage>>;

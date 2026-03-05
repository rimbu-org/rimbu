import { List } from '@rimbu/list2';

const l = List.empty<number>()
	.append(1)
	.append(2)
	.append(3)
	.append(4)
	.reversed();

console.log((l as any)._structure());

const l2 = (l as any).drop(1);

console.log(l2._structure());

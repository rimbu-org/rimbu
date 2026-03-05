import { List } from '@rimbu/list2';
import { CharList } from '@rimbu/list2/char';
import { BitList } from 'entry/bit';

{
	let l = List.empty<number>();
	console.log((l as any)._structure());

	for (let i = 0; i < 26; i++) {
		l = l.prepend(i);
		console.log(`--- appended ${i} ---`);
		console.log((l as any).reversed()._structure());
	}
}

{
	let l = CharList.empty();
	console.log((l as any)._structure());

	for (let i = 0; i < 26; i++) {
		const a = String.fromCharCode(97 + i);
		l = l.prepend(a);
		console.log(`--- appended ${a} ---`);
		console.log((l as any).reversed()._structure());
	}
}

{
	let l = BitList.empty();
	console.log((l as any)._structure());

	for (let i = 0; i < 26; i++) {
		const v = i % 2 === 0;
		l = l.append(v);
		console.log(`--- appended ${v} ---`);
		console.log((l as any).reversed()._structure());
	}
}

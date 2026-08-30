import { SortedMap } from '@rimbu/sorted/map';
import { runMapRandomTestsWith } from '@rimbu/collection-types/test-utils/map/map-random';

// @ts-ignore legacy RMap.Context vs SortedMap.Context mismatch until 10
runMapRandomTestsWith('SortedMap default', (SortedMap as any).createContext<number>({}));

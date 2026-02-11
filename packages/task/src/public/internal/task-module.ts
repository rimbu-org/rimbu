import type { Task } from '@rimbu/task';

import { Module } from '@rimbu/common/module';
import { TaskContextImpl } from './task-context-impl';

export const taskModule = Module.create<Task.Constructors>((mod) => ({
	rootContext: Module.lazyGetter(
		() => new TaskContextImpl('root', true, undefined),
	),
	create: (task) => task,
	launch: Module.lazyGetter(() => mod.rootContext.launch),
}));

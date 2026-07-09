import type { Task } from '@rimbu/task';

import { Module } from '@rimbu/common/module';

import { TaskContextImpl } from '#task/task-context-impl';

export const taskModule = Module.create<Task.Constructors>((mod) => ({
	rootContext: Module.lazyGetter(
		() => new TaskContextImpl('root', true, undefined),
	),
	fn: (task) => task,
	modifier: (mod) => mod,
	launch: Module.lazyGetter(() => mod.rootContext.launch),
}));

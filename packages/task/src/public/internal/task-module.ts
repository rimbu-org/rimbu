import type { Task } from '@rimbu/task';

import { Module } from '@rimbu/common/module';
import { TaskContextImpl } from './task-context-impl';

export const taskModule = Module.create<Task.Constructors>((mod) => ({
	rootContext: Module.lazy(() => new TaskContextImpl('root', true, undefined)),
	create: Module.factory((task) => task),
	launch: Module.lazy(() => mod.rootContext.launch),
}));

import { HashMap } from '@rimbu/hashed';
import { Deep } from '@rimbu/deep';

import { SlicePatch } from 'patch/slice-patch.mjs';
import { Slice, Actor } from 'main/index.mjs';

interface Todo {
  title: string;
  completed: boolean;
}

const todosSlice = SlicePatch.create({
  initState: {
    todoMap: HashMap.empty<number, Todo>(),
    nextId: 0,
  },
  actions: {
    addTodo: (title: string) => [
      {
        todoMap: (todos, { nextId }) =>
          todos.set(nextId, { title, completed: false }),
        nextId: (v) => v + 1,
      },
    ],
    removeTodo: (id: number) => [{ todoMap: (todos) => todos.removeKey(id) }],
    toggleTodo: (id: number) => [
      {
        todoMap: (todos) =>
          todos.updateAt(id, Deep.patchWith([{ completed: (v) => !v }])),
      },
    ],
    setTodoTitle: (id: number, title: string) => [
      {
        todoMap: (todos) => todos.updateAt(id, Deep.patchWith([{ title }])),
      },
    ],
    clearCompleted: () => [
      {
        todoMap: (todos) => todos.filter(([_, todo]) => !todo.completed),
      },
    ],
    clearAll: () => [
      {
        todoMap: HashMap.empty<number, Todo>(),
      },
    ],
  },
});

const newTodoSlice = SlicePatch.create({
  initState: {
    title: '',
  },
  actions: {
    setTitle: (title: string) => ({ title }),
  },
  includeActions: (include) => ({
    ...include(todosSlice.actions.addTodo, () => [{ title: '' }]),
  }),
});

const combinedSlice = Slice.combine({
  todos: todosSlice,
  newTodo: newTodoSlice,
});

function createTodoActor() {
  const actor = Actor.configure(combinedSlice).build();

  return {
    todosActor: actor.focus('todos'),
    newTodoActor: actor.focus('newTodo'),
  };
}

describe('todos', () => {
  it('adds a new todo', () => {
    const { todosActor, newTodoActor } = createTodoActor();
    const { nextId } = todosActor.state;
    newTodoActor.actions.setTitle('Test Todo');
    todosActor.actions.addTodo(newTodoActor.state.title);
    expect(todosActor.state.todoMap.size).toBe(1);
    const todoActor = todosActor
      .asObservable()
      .select((s) => s.todoMap.get(nextId));
    expect(todoActor.value).toEqual({
      title: 'Test Todo',
      completed: false,
    });
    expect(newTodoActor.state.title).toBe('');
  });

  it('toggles a todo', () => {
    const { todosActor, newTodoActor } = createTodoActor();
    const { nextId } = todosActor.state;
    newTodoActor.actions.setTitle('Test Todo');
    const todoActor = todosActor
      .asObservable()
      .select((s) => s.todoMap.get(nextId));
    todosActor.actions.addTodo(newTodoActor.state.title);
    expect(todoActor.value?.completed).toBe(false);
    todosActor.actions.toggleTodo(nextId);
    expect(todoActor.value?.completed).toBe(true);
    todosActor.actions.toggleTodo(nextId);
    expect(todoActor.value?.completed).toBe(false);
  });
});

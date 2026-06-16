"use client";

import { useSyncExternalStore } from "react";

type Listener = () => void;
type State = any;

type Updater = (state: State) => State;

type StoreApi<T extends State> = {
  getState: () => T;
  setState: (partial: Partial<T> | Updater) => void;
  subscribe: (listener: Listener) => () => void;
};

export function create<T extends State>(
  initializer: (
    set: StoreApi<T>["setState"],
    get: StoreApi<T>["getState"]
  ) => T
) {
  let state: T;
  const listeners = new Set<Listener>();
  const setState: StoreApi<T>["setState"] = (partial) => {
    const next =
      typeof partial === "function"
        ? (partial as Updater)(state)
        : { ...state, ...partial };
    if (Object.is(next, state)) return;
    state = next;
    listeners.forEach((l) => l());
  };
  const getState: StoreApi<T>["getState"] = () => state;
  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  state = initializer(setState, getState);

  function useStore<U = T>(selector: (state: T) => U = (s) => s as unknown as U): U {
    return useSyncExternalStore(
      subscribe,
      () => selector(state),
      () => selector(state)
    );
  }
  return { getState, setState, subscribe, useStore };
}

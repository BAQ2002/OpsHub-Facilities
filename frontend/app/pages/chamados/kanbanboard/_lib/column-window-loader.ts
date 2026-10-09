import { connectionFailure, type ApiFailure, type ApiResult } from "@/app/entities/api/api-result";
import type { RequestBoardColumnViewModel } from "@/app/entities/navigation_entities/chamados_kanbanboard_viewModels";

export type ColumnWindow = Omit<RequestBoardColumnViewModel, "title">;
export type ColumnWindowUpdate = { pending: boolean; error: ApiFailure | null; data?: ColumnWindow };

/** One request per column at a time; rapid scrolls keep only the latest desired position. */
export function createColumnWindowLoader(
  load: (id: number, offset: number) => Promise<ApiResult<ColumnWindow>>,
  update: (id: number, state: ColumnWindowUpdate) => void,
) {
  let active = true;
  let generation = 0;
  const tasks = new Map<number, { desired: number; loaded: number; pending: boolean }>();

  async function run(id: number) {
    const task = tasks.get(id)!;
    if (!active || task.pending || task.loaded === task.desired) return;
    const offset = task.desired;
    const ticket = generation;
    task.pending = true;
    update(id, { pending: true, error: null });
    let result: ApiResult<ColumnWindow>;
    try { result = await load(id, offset); }
    catch { result = { ok: false, error: connectionFailure }; }
    if (!active || ticket !== generation) return;
    task.pending = false;
    if (task.desired !== offset) {
      if (task.desired === task.loaded) update(id, { pending: false, error: null });
      else void run(id);
      return;
    }
    if (result.ok) {
      task.loaded = result.data.offset;
      task.desired = result.data.offset;
      update(id, { data: result.data, pending: false, error: null });
    } else update(id, { pending: false, error: result.error });
  }

  return {
    request(id: number, offset: number) {
      const task = tasks.get(id) ?? { desired: 0, loaded: 0, pending: false };
      task.desired = offset;
      tasks.set(id, task);
      void run(id);
    },
    activate() { active = true; },
    dispose() { active = false; generation++; tasks.clear(); },
  };
}

import { EventEmitter } from "events";

declare global {
  // eslint-disable-next-line no-var
  var opsEvents: EventEmitter | undefined;
}

export const opsEvents = global.opsEvents ?? new EventEmitter();
global.opsEvents = opsEvents;
opsEvents.setMaxListeners(50);

export type OpsEvent =
  | { type: "order.created"; shiftId: string | null; publicId: string; order: unknown }
  | { type: "order.status_changed"; shiftId: string | null; publicId: string; order: unknown }
  | { type: "shift.opened"; shiftId: string }
  | { type: "shift.closed"; shiftId: string };

export function emitOpsEvent(event: OpsEvent) {
  opsEvents.emit("ops", event);
  if (event.shiftId) {
    opsEvents.emit(`shift:${event.shiftId}`, event);
  }
  if ("publicId" in event && event.publicId) {
    opsEvents.emit(`order:${event.publicId}`, event);
  }
}

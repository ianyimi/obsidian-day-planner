import moment from "moment";
import { get } from "svelte/store";

import { defaultSettingsForTests } from "../../../../settings";
import type { DayToTasks } from "../../../../task-types";
import { baseTask } from "../../test-utils";
import { EditMode } from "../types";

import {
  baseTasks,
  dayKey,
  emptyTasks,
  nextDayKey,
  unscheduledTask,
} from "./util/fixtures";
import { setUp } from "./util/setup";

describe("moving tasks between containers", () => {
  test("with no edit operation in progress, nothing happens on mouse move", () => {
    const { todayControls, moveCursorTo, displayedTasks } = setUp({
      tasks: baseTasks,
    });

    const initial = get(displayedTasks);

    todayControls.handleMouseEnter();
    moveCursorTo("01:00");

    expect(get(displayedTasks)).toEqual(initial);
  });

  test("scheduling works between days", () => {
    const { todayControls, nextDayControls, moveCursorTo, displayedTasks } =
      setUp({
        tasks: unscheduledTask,
      });

    todayControls.handleGripMouseDown(baseTask, EditMode.DRAG);
    nextDayControls.handleMouseEnter();
    moveCursorTo("01:00");

    expect(get(displayedTasks)).toMatchObject({
      [dayKey]: {
        noTime: [],
        withTime: [],
      },
      [nextDayKey]: {
        withTime: [{ startTime: moment("2023-01-02 01:00") }],
      },
    });
  });

  test("drag works between days", () => {
    const tasks: DayToTasks = {
      [dayKey]: {
        withTime: [
          baseTask,
          { ...baseTask, id: "2", startTime: moment("2023-01-01 01:00") },
        ],
        noTime: [],
      },
      [nextDayKey]: {
        withTime: [
          { ...baseTask, id: "3", startTime: moment("2023-01-02 01:00") },
        ],
        noTime: [],
      },
    };

    const { todayControls, nextDayControls, moveCursorTo, displayedTasks } =
      setUp({
        tasks,
      });

    todayControls.handleGripMouseDown(baseTask, EditMode.DRAG);
    nextDayControls.handleMouseEnter();
    moveCursorTo("01:00");

    expect(get(displayedTasks)).toMatchObject({
      [dayKey]: {
        withTime: [{ id: "2", startTime: moment("2023-01-01 01:00") }],
      },
      [nextDayKey]: {
        withTime: [
          { startTime: moment("2023-01-02 01:00") },
          { id: "3", startTime: moment("2023-01-02 01:00") },
        ],
      },
    });
  });

  test("drag many works between days", () => {
    const tasks: DayToTasks = {
      [dayKey]: {
        withTime: [
          baseTask,
          { ...baseTask, id: "2", startTime: moment("2023-01-01 01:00") },
        ],
        noTime: [],
      },
      [nextDayKey]: {
        withTime: [
          { ...baseTask, id: "3", startTime: moment("2023-01-02 01:00") },
        ],
        noTime: [],
      },
    };

    const { todayControls, nextDayControls, moveCursorTo, displayedTasks } =
      setUp({
        tasks,
        settings: { ...defaultSettingsForTests },
      });

    todayControls.handleGripMouseDown(baseTask, EditMode.DRAG_AND_SHIFT_OTHERS);
    nextDayControls.handleMouseEnter();
    moveCursorTo("01:00");

    expect(get(displayedTasks)).toMatchObject({
      [dayKey]: {
        withTime: [{ id: "2", startTime: moment("2023-01-01 01:00") }],
      },
      [nextDayKey]: {
        withTime: [
          { startTime: moment("2023-01-02 01:00") },
          { id: "3", startTime: moment("2023-01-02 02:00") },
        ],
      },
    });
  });

  test("create works between days", () => {
    const { todayControls, moveCursorTo, nextDayControls, displayedTasks } =
      setUp({
        tasks: emptyTasks,
      });

    moveCursorTo("01:00");
    todayControls.handleContainerMouseDown();
    nextDayControls.handleMouseEnter();
    moveCursorTo("02:00");

    expect(get(displayedTasks)).toMatchObject({
      [dayKey]: {
        withTime: [],
      },
      [nextDayKey]: {
        withTime: [
          { startTime: moment("2023-01-02 01:00"), durationMinutes: 60 },
        ],
      },
    });
  });

  test("resize doesn't work between days", () => {
    const { todayControls, nextDayControls, displayedTasks } = setUp();

    todayControls.handleResizerMouseDown(baseTask, EditMode.RESIZE);
    nextDayControls.handleMouseEnter();

    expect(get(displayedTasks)).toMatchObject({
      [dayKey]: {
        withTime: [{ id: "id", startTime: moment("2023-01-01 00:00") }],
      },
      [nextDayKey]: {
        withTime: [],
      },
    });
  });
});

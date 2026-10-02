import { test } from "node:test";
import assert from "node:assert/strict";
import {
  catchAt,
  clampPosition,
  parseCollection,
  prizes,
  targets,
} from "../src/game.ts";

test("each prize can be caught at its center and at the tolerance boundary", () => {
  targets.forEach((target, index) => {
    assert.equal(catchAt(target)?.id, prizes[index].id);
    assert.equal(catchAt(target + 24)?.id, prizes[index].id);
  });
});

test("dropping between prizes misses, rather than awarding a random prize", () => {
  assert.equal(catchAt(303), null);
  assert.equal(catchAt(371), null);
  assert.equal(catchAt(441), null);
});

test("arrow movement never escapes the glass chamber", () => {
  assert.equal(clampPosition(-999), 249);
  assert.equal(clampPosition(999), 489);
  assert.equal(clampPosition(337), 337);
});

test("saved collection tolerates missing, corrupt, and untrusted data", () => {
  assert.deepEqual(parseCollection("broken"), {});
  assert.deepEqual(parseCollection("null"), {});
  assert.deepEqual(parseCollection("[]"), {});
  const counts = parseCollection(
    '{"classic":3,"sunshine":-1,"cosmic":"9","royal":1e8,"unknown":9}',
  );
  assert.deepEqual(counts, { classic: 3, sunshine: 0, cosmic: 0, royal: 9999 });
  assert.deepEqual(parseCollection(null), {
    classic: 0,
    sunshine: 0,
    cosmic: 0,
    royal: 0,
  });
});

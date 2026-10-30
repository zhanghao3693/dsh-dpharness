#!/usr/bin/env node
/**
 * 端维度上报的 value 形状测试（2026-10-30）。
 *
 * 锁住三件事，任何一条被改坏，站点侧都会**静默**少解析出一个字段：
 *   1. `pkg=` 段存在且只出现在插件维度事件里
 *   2. `c=` 段在 `v=` 之前 —— v= 是覆盖率判据，必须留在末尾（截断先吃尾部）
 *   3. 包名里的 `/` `@` 不被 clean() 吃掉（`@scope/name` 必须原样保留）
 *
 * 另附 hostClientOf 的四值断言：它是端维度的源头，值域错了下游全错。
 *
 * 运行：node test-track-payload.mjs
 */

import { buildTrackPayload, hostClientOf } from "./lib/index.js";

let pass = 0;
const failures = [];

function check(name, cond, detail) {
  if (cond) {
    pass += 1;
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
  }
}

// ---------------------------------------------------------------- pkg 段
{
  const p = buildTrackPayload({
    event: "hub_plugin_install",
    detail: { action: "install", pkg: "dshmarket" },
    visitorId: "htest12345678",
  });
  check("install: type 正确", p.type === "hub_plugin_install", p.type);
  check("install: 含 pkg=dshmarket", p.value.includes("pkg=dshmarket"), p.value);
  check("install: path 固定 /dsh-plugin", p.path === "/dsh-plugin", p.path);
}

{
  const p = buildTrackPayload({
    event: "hub_plugin_use",
    detail: { action: "use", pkg: "@scope/name" },
    visitorId: "htest12345678",
  });
  check(
    "use: scope 包名原样保留",
    p.value.includes("pkg=@scope/name"),
    p.value,
  );
}

{
  const p = buildTrackPayload({
    event: "hub_plugin_use",
    detail: { action: "use", pkg: "_truncated" },
    visitorId: "htest12345678",
  });
  check("截断哨兵可达", p.value.includes("pkg=_truncated"), p.value);
}

// ------------------------------------------------- 段顺序：c= 必须在 v= 之前
{
  const p = buildTrackPayload({
    event: "hub_plugin_use",
    detail: { action: "use", pkg: "dshmarket" },
    visitorId: "htest12345678",
  });
  const segments = p.value.split(":");
  const iC = segments.findIndex((s) => s.startsWith("c="));
  const iV = segments.findIndex((s) => s.startsWith("v="));
  check("c= 与 v= 都存在", iC >= 0 && iV >= 0, p.value);
  check("c= 在 v= 之前", iC >= 0 && iV > iC, `c@${iC} v@${iV} · ${p.value}`);
  check("v= 是最后一段", iV === segments.length - 1, p.value);
  check("c= 值属四值域", /^c=(ow|od|td|tu)$/.test(segments[iC]), segments[iC]);
}

// -------------------------------------------------- 不带 pkg 的事件不受影响
{
  const p = buildTrackPayload({
    event: "plugin_hub",
    detail: { action: "hello" },
    visitorId: "htest12345678",
  });
  check("plugin_hub 不含 pkg=", !p.value.includes("pkg="), p.value);
  check("plugin_hub 仍带 c=", /:c=(ow|od|td|tu):/.test(p.value), p.value);
}

// -------------------------------------------------------------- 非法入参
{
  const p = buildTrackPayload({
    event: "hub_plugin_use",
    detail: { action: "use", pkg: "bad pkg;rm -rf /" },
    visitorId: "short",
  });
  check("visitorId 不合规被丢弃", p.visitorId === null, String(p.visitorId));
  check("包名中的空格与分号被清掉", !/[\s;]/.test(p.value.split("pkg=")[1] || ""), p.value);
}

// ------------------------------------------------------ hostClientOf 值域
{
  const cases = [
    [{ execPath: "/usr/local/bin/node", isElectron: false }, "ow"],
    [{ execPath: "/Applications/DeepSeek Harness.app/Contents/MacOS/DeepSeek Harness", isElectron: true }, "od"],
    [{ execPath: "/Applications/DSH Desktop.app/Contents/MacOS/DSH Desktop", isElectron: true }, "td"],
    [{ execPath: "/Applications/DSH Desktop Beta.app/Contents/MacOS/DSH Desktop Beta", isElectron: true }, "td"],
    [{ execPath: "/Applications/Something.app/Contents/MacOS/Something", isElectron: true }, "tu"],
    [{ execPath: "C:\\Program Files\\dsh-desktop\\dsh-desktop.exe", isElectron: true }, "td"],
  ];
  for (const [input, want] of cases) {
    const got = hostClientOf(input);
    check(`hostClientOf(${input.execPath.split(/[\\/]/).pop()})`, got === want, `want ${want} got ${got}`);
  }
}

// ------------------------------------------------------------------ 汇总
console.log(`\n通过 ${pass}/${pass + failures.length}`);
if (failures.length) {
  console.log("\n失败项：");
  for (const f of failures) console.log("  ✗ " + f);
  process.exit(1);
}
console.log("全部通过");

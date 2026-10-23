#!/usr/bin/env python3
"""把本地 origin/main..HEAD 的提交 + 当前 tag 经 GitHub Git Data API 推上去。

## 为什么需要它

本机 `github.com:443` 不可达（直连超时、代理 502），但 `api.github.com` 正常。
`git push` 会一直挂到超时，而这个脚本走 Git Data API，把提交**原样**推上去。

## 关键约束（设计取舍）

- **绝不"内容同、sha 不同"**：逐个提交用 base_tree + 变更文件建 tree、再建 commit，
  每一步都拿 API 返回的 sha 与本地 `git rev-parse` 比对，全部一致才动 ref。
  任何一步不一致立即中止 —— 远端只留悬空对象，分支不动。
- **只推显式范围**：`origin/main..HEAD`，不做任何 `-A` 式全量操作。
- **不改写历史**：PATCH refs/heads/main 用 `force=false`，落后于远端会直接失败。

## 用法

    python3 scripts/push-via-api.py              # 推提交 + HEAD 上的 tag（若有）
    python3 scripts/push-via-api.py --tag v0.6.8 # 指定要创建的 tag
    python3 scripts/push-via-api.py --dry-run    # 只打印计划，不调 API

前置：`gh auth status` 有 repo 权限；本地 `origin` 的 URL 指向目标仓库（用于解析 REPO）。

⚠️ 推完 tag 后 GitHub Actions 的 publish 工作流才会跑；不用再 `git push`。
"""
import argparse
import base64
import json
import re
import subprocess
import sys

CWD = subprocess.run(
    ["git", "rev-parse", "--show-toplevel"], capture_output=True, check=True
).stdout.decode().strip()


def git(*args, binary=False):
    out = subprocess.run(["git", *args], cwd=CWD, capture_output=True, check=True).stdout
    return out if binary else out.decode()


def resolve_repo():
    """从 origin 的 URL 解析 owner/repo，避免把仓库名写死在脚本里。"""
    url = git("remote", "get-url", "origin").strip()
    m = re.search(r"github\.com[:/]+([^/]+)/([^/.]+?)(?:\.git)?$", url)
    if not m:
        sys.exit(f"[中止] 无法从 origin URL 解析仓库名：{url}")
    return f"{m.group(1)}/{m.group(2)}"


REPO = resolve_repo()


def gh(method, path, body=None, dry=False):
    if dry:
        print(f"  [dry-run] {method} {path}")
        return {}
    cmd = ["gh", "api", "-X", method, path, "-H", "Accept: application/vnd.github+json"]
    if body is None:
        res = subprocess.run(cmd, cwd=CWD, capture_output=True)
    else:
        cmd += ["--input", "-"]
        res = subprocess.run(cmd, cwd=CWD, input=json.dumps(body).encode(), capture_output=True)
    if res.returncode != 0:
        sys.exit(f"[中止] gh api {method} {path} 失败：{res.stderr.decode()[:600]}")
    return json.loads(res.stdout.decode() or "{}")


def iso(ts, tz):
    """按提交里记录的时钟渲染，再拼它自己的偏移。

    用 `date -u` 渲染会把时钟整体挪 8 小时，导致 commit sha 对不上（2026-10-22 踩过）。
    """
    clock = subprocess.run(
        ["date", "-r", ts, "+%Y-%m-%dT%H:%M:%S"], capture_output=True, check=True
    ).stdout.decode().strip()
    return clock + f"{tz[:3]}:{tz[3:]}"


def parse_changes(sha):
    """返回 [(path, mode)]；遇到删除/重命名直接中止（本脚本只做新增与修改）。"""
    out = []
    lines = git("diff-tree", "--no-commit-id", "-r", "--raw", "--no-abbrev", sha).splitlines()
    for line in lines:
        if not line.startswith(":"):
            continue
        meta, path = line[1:].split("\t", 1)
        new_mode, status = meta.split()[1], meta.split()[4]
        if status not in ("A", "M", "T", "C"):
            sys.exit(
                f"[中止] {sha[:7]} 含暂不支持的变更类型 {status}：{path}\n"
                "  删除/重命名请先在本地拆成独立提交，或手工 push 处理。"
            )
        out.append((path, new_mode))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="origin/main", help="远端已有提交（默认 origin/main）")
    ap.add_argument("--tag", default=None, help="要创建的 tag（默认取 HEAD 上的 tag）")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    base = git("rev-parse", args.base).strip()
    commits = git("rev-list", "--reverse", f"{base}..HEAD").split()
    tag = args.tag
    if tag is None:
        tags = git("tag", "--points-at", "HEAD").split()
        tag = tags[0] if tags else None

    # tag 先校验存在性：不存在时直接给人话，不要让 traceback 糊住（2026-10-23 试跑踩到）
    tag_sha = None
    if tag:
        res = subprocess.run(
            ["git", "rev-parse", "--verify", f"{tag}^{{commit}}"], cwd=CWD, capture_output=True
        )
        if res.returncode != 0:
            sys.exit(f"[中止] 本地不存在 tag {tag}（先 git tag {tag} 或去掉 --tag）")
        tag_sha = res.stdout.decode().strip()
        if tag_sha != git("rev-parse", "HEAD").strip():
            print(f"⚠️ tag {tag} 不指向 HEAD（{tag_sha[:7]} ≠ {git('rev-parse', 'HEAD')[:7]}），仍按你的指定推送")

    print(f"repo={REPO} base={base[:7]} 待推 {len(commits)} 个提交 tag={tag or '（无）'}")
    if not commits and not tag:
        print("没有要推的内容。")
        return

    for sha in commits:
        raw = git("cat-file", "-p", sha, binary=True).decode("utf-8", "surrogateescape")
        header, _, message = raw.partition("\n\n")
        author = re.search(r"^author (.+) <(.+)> (\d+) ([+-]\d{4})$", header, re.M)
        committer = re.search(r"^committer (.+) <(.+)> (\d+) ([+-]\d{4})$", header, re.M)
        if not author or not committer:
            sys.exit(f"[中止] {sha[:7]} 解析不到 author/committer")

        parent = git("rev-parse", f"{sha}^").strip()
        parent_tree = git("rev-parse", f"{sha}^^{{tree}}").strip()

        entries = []
        for path, mode in parse_changes(sha):
            content = git("show", f"{sha}:{path}", binary=True)
            blob = gh("POST", f"repos/{REPO}/git/blobs", {
                "content": base64.b64encode(content).decode(),
                "encoding": "base64",
            }, args.dry_run)["sha"] if not args.dry_run else "dry"
            if not args.dry_run and blob != git("rev-parse", f"{sha}:{path}").strip():
                sys.exit(f"[中止] {sha[:7]} {path} blob 不符")
            entries.append({"path": path, "mode": mode, "type": "blob", "sha": blob})

        tree = gh("POST", f"repos/{REPO}/git/trees",
                  {"base_tree": parent_tree, "tree": entries}, args.dry_run)
        if not args.dry_run:
            if tree["sha"] != git("rev-parse", f"{sha}^{{tree}}").strip():
                sys.exit(f"[中止] {sha[:7]} tree 不符")
            body = {
                "message": message,
                "tree": tree["sha"],
                "parents": [parent],
                "author": {"name": author.group(1), "email": author.group(2),
                           "date": iso(author.group(3), author.group(4))},
                "committer": {"name": committer.group(1), "email": committer.group(2),
                              "date": iso(committer.group(3), committer.group(4))},
            }
            created = gh("POST", f"repos/{REPO}/git/commits", body)["sha"]
            if created != sha:
                sys.exit(f"[中止] {sha[:7]} commit 不符：api={created[:8]}")
        print(f"  ✓ {sha[:7]} {message.splitlines()[0][:60]}")

    head = git("rev-parse", "HEAD").strip()
    if head != git("rev-parse", args.base).strip() or commits:
        print(f"更新 refs/heads/main → {head[:7]}")
        gh("PATCH", f"repos/{REPO}/git/refs/heads/main", {"sha": head, "force": False}, args.dry_run)

    if tag:
        if args.dry_run:
            print(f"  [dry-run] 创建 tag {tag} → {tag_sha[:7]}")
        else:
            exists = subprocess.run(
                ["gh", "api", f"repos/{REPO}/git/ref/tags/{tag}"], cwd=CWD, capture_output=True
            )
            if exists.returncode == 0:
                print(f"tag {tag} 已存在于远端，跳过")
            else:
                gh("POST", f"repos/{REPO}/git/refs", {"ref": f"refs/tags/{tag}", "sha": tag_sha})
                print(f"创建 tag {tag} → {tag_sha[:7]}")

    if not args.dry_run:
        # 本地远端跟踪引用同步，否则 release.mjs 的「main 与 origin/main 齐平」检查会误判
        subprocess.run(["git", "update-ref", "refs/remotes/origin/main", head], cwd=CWD, check=True)
        print(f"远端 main = {gh('GET', f'repos/{REPO}/git/ref/heads/main')['object']['sha'][:7]}")


if __name__ == "__main__":
    main()

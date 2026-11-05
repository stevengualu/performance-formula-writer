#!/usr/bin/env bash
# DSH 插件发版助手。
#
#   ./scripts/release.sh init            首次：建 GitHub 仓库、配 origin、推 main
#   ./scripts/release.sh 1.2.0           发版：改版本号、commit、打 tag、push、建 Release
#
# 凭据：${GITHUB_TOKEN}，或 ~/.dsh/github-token（内容只有 token，chmod 600）。
# 配置：仓库根的 .release.env（已 gitignore），可写 OWNER / REPO / VISIBILITY / GIT_NAME / GIT_EMAIL。
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -f "$ROOT/.release.env" ]]; then
  set -a; . "$ROOT/.release.env"; set +a
fi

: "${REPO:=performance-formula-writer}"
: "${VISIBILITY:=public}"
: "${SKIP_RELEASE:=0}"

TOKEN="${GITHUB_TOKEN:-}"
if [[ -z "$TOKEN" ]]; then
  for f in "${GITHUB_TOKEN_FILE:-$HOME/.dsh/github-token}" "$HOME/.dsh/github_token"; do
    if [[ -f "$f" ]]; then TOKEN="$(tr -d ' \t\r\n' < "$f")"; break; fi
  done
fi

die() { printf 'error: %s\n' "$*" >&2; exit 1; }
need_token() {
  [[ -n "$TOKEN" ]] || die "没有 GitHub token。设置 GITHUB_TOKEN，或把 token 写进 ~/.dsh/github-token（chmod 600）。"
}

api() {
  local method="$1" path="$2" body="${3:-}"
  local args=(-sS -X "$method"
    -H "Authorization: Bearer $TOKEN"
    -H "Accept: application/vnd.github+json"
    -H "X-GitHub-Api-Version: 2022-11-28"
    "https://api.github.com$path")
  [[ -n "$body" ]] && args+=(-d "$body")
  curl "${args[@]}"
}

resolve_owner() {
  [[ -n "${OWNER:-}" ]] && return 0
  need_token
  OWNER="$(api GET /user | python3 -c 'import json,sys; print(json.load(sys.stdin).get("login",""))')"
  [[ -n "$OWNER" ]] || die "读不到 GitHub 用户名，请在 .release.env 里写 OWNER=..."
}

ensure_identity() {
  [[ -n "${GIT_NAME:-}" ]] && git config user.name "$GIT_NAME"
  [[ -n "${GIT_EMAIL:-}" ]] && git config user.email "$GIT_EMAIL"
  git config user.name >/dev/null 2>&1 || die "没有 git 身份，请在 .release.env 里写 GIT_NAME / GIT_EMAIL"
}

# 用 Authorization 头推送，token 不落进 .git/config，也不出现在 URL 里。
push() {
  need_token
  local b64
  b64="$(printf 'x-access-token:%s' "$TOKEN" | base64 | tr -d '\n')"
  git -c "http.extraHeader=Authorization: Basic $b64" push "$@"
}

cmd_init() {
  need_token; resolve_owner; ensure_identity
  local remote="https://github.com/$OWNER/$REPO.git"

  if api GET "/repos/$OWNER/$REPO" | grep -q '"full_name"'; then
    echo "仓库已存在：$OWNER/$REPO"
  else
    local private=false
    [[ "$VISIBILITY" == "private" ]] && private=true
    local out
    out="$(api POST /user/repos "{\"name\":\"$REPO\",\"private\":$private,\"description\":\"DSH 插件：绩效算分公式撰写（左侧栏面板）\"}")"
    grep -q '"full_name"' <<<"$out" || die "建仓失败：$out"
    echo "已建立仓库：$OWNER/${REPO}（${VISIBILITY}）"
  fi

  git remote get-url origin >/dev/null 2>&1 \
    && git remote set-url origin "$remote" \
    || git remote add origin "$remote"

  if ! git rev-parse HEAD >/dev/null 2>&1; then
    git add -A && git commit -m "feat: 绩效算分公式插件 v$(python3 -c 'import json;print(json.load(open("package.json"))["version"])')"
  fi
  push -u origin HEAD:main
  git branch --set-upstream-to=origin/main main 2>/dev/null || true
  echo "完成：https://github.com/$OWNER/$REPO"
}

cmd_release() {
  local version="${1:-}"
  [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "用法：./scripts/release.sh 1.2.0"
  need_token; resolve_owner; ensure_identity

  python3 - "$version" <<'PY'
import json, sys
path = 'package.json'
with open(path, encoding='utf-8') as f:
    data = json.load(f)
data['version'] = sys.argv[1]
with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write('\n')
PY

  git add -A
  git commit -m "release v$version" || echo "没有需要提交的改动"
  git tag -d "v$version" >/dev/null 2>&1 || true
  git tag -a "v$version" -m "v$version"

  push origin HEAD:main
  push origin "v$version"

  if [[ "$SKIP_RELEASE" != "1" ]]; then
    local body
    body="$(api POST "/repos/$OWNER/$REPO/releases" \
      "{\"tag_name\":\"v$version\",\"name\":\"v$version\",\"generate_release_notes\":true}" || true)"
    if grep -q '"html_url"' <<<"$body"; then
      echo "Release：$(python3 -c 'import json,sys;print(json.load(sys.stdin)["html_url"])' <<<"$body")"
    else
      echo "警告：Release 未创建（tag 已推送）：$body" >&2
    fi
  fi

  echo "发版完成：v$version"
  echo "他人安装：github:$OWNER/$REPO#v$version"
}

case "${1:-}" in
  init) cmd_init ;;
  ""|-h|--help) sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//' ;;
  *) cmd_release "$@" ;;
esac

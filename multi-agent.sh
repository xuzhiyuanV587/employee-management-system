#!/bin/bash
# 多 Claude Agent tmux 启动脚本
# 用法: ./multi-agent.sh [任务描述文件]

SESSION="claude-agents"
WORKDIR="/Users/macbook/employee-management-system"
CLAUDE="/Users/macbook/.nvm/versions/node/v22.22.1/bin/claude"

# 如果 session 已存在，直接 attach
if tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "Session '$SESSION' already exists. Attaching..."
  tmux attach-session -t "$SESSION"
  exit 0
fi

# 创建新 session，主窗口: 任务调度器
tmux new-session -d -s "$SESSION" -n "coordinator" -c "$WORKDIR"

# 窗口 1: Agent 1 - 前端任务
tmux new-window -t "$SESSION" -n "agent-frontend" -c "$WORKDIR/frontend"

# 窗口 2: Agent 2 - 后端任务
tmux new-window -t "$SESSION" -n "agent-backend" -c "$WORKDIR/server"

# 窗口 3: Agent 3 - 通用/文档任务
tmux new-window -t "$SESSION" -n "agent-general" -c "$WORKDIR"

# 窗口 4: 监控 (查看日志/git 状态)
tmux new-window -t "$SESSION" -n "monitor" -c "$WORKDIR"

# --- 在各窗口中发送命令 ---

# coordinator 窗口: 显示项目状态
tmux send-keys -t "$SESSION:coordinator" "echo '=== Claude Multi-Agent Coordinator ===' && git status --short && echo '' && echo 'Windows:' && echo '  coordinator  - 任务协调' && echo '  agent-frontend - 前端 Agent (claude)' && echo '  agent-backend  - 后端 Agent (claude)' && echo '  agent-general  - 通用 Agent (claude)' && echo '  monitor        - 监控'" Enter

# agent-frontend 窗口: 启动 Claude
tmux send-keys -t "$SESSION:agent-frontend" "$CLAUDE" Enter

# agent-backend 窗口: 启动 Claude
tmux send-keys -t "$SESSION:agent-backend" "$CLAUDE" Enter

# agent-general 窗口: 启动 Claude
tmux send-keys -t "$SESSION:agent-general" "$CLAUDE" Enter

# monitor 窗口: 监控 git 变化
tmux send-keys -t "$SESSION:monitor" "watch -n 5 'git status --short && echo \"---\" && git log --oneline -5'" Enter

# 回到 coordinator 窗口
tmux select-window -t "$SESSION:coordinator"

# attach
tmux attach-session -t "$SESSION"

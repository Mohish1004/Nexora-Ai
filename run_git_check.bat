@echo off
cd /d "F:\Projects\CentricAi"
git status --porcelain > git_status_output.txt 2>&1
git log --oneline -5 >> git_status_output.txt 2>&1
echo Done >> git_status_output.txt

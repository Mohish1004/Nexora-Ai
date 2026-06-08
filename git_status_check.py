import subprocess, json, os
os.chdir(r"F:\Projects\CentricAi")
result = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, timeout=30)
with open("git_status_output.txt", "w") as f:
    f.write(result.stdout or "NO OUTPUT")
    if result.stderr:
        f.write("\n\nSTDERR:\n" + result.stderr)
    f.write("\n\n---\n")
    log_result = subprocess.run(["git", "log", "--oneline", "-5"], capture_output=True, text=True, timeout=30)
    f.write(log_result.stdout or "NO LOG OUTPUT")

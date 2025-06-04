import subprocess
from typing import List, Dict
import tempfile

def lint_python(code: str) -> List[Dict[str, int | str]]:
    with tempfile.NamedTemporaryFile(mode='w+', suffix='.py', delete=False) as tmp:
        tmp.write(code)
        tmp.flush()

        result = subprocess.run(
            ["flake8", "--format=%(row)d:%(col)d: %(code)s %(text)s", tmp.name],
            capture_output=True, text=True
        )

        # Calculate offsets
        lines = code.splitlines(keepends=True)
        offsets = []
        current = 0
        for line in lines:
            offsets.append(current)
            current += len(line)

        issues = []
        for line in result.stdout.strip().split("\n"):
            if not line.strip():
                continue
            parts = line.split(":", 2)
            if len(parts) < 3:
                continue
            row, col, message = parts
            line_num = int(row) - 1
            col_num = int(col) - 1

            start = offsets[line_num] + col_num
            end = start + 1

            issues.append({
                "message": message.strip(),
                "from": start,
                "to": end
            })

        return issues

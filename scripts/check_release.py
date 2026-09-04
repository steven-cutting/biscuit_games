"""Assert a release tag names the version `package.json` carries.

The tag is the version's only claim to be that version, and nothing else checks
it. A tag that disagrees with the manifest publishes one number under another
name, and GitHub Packages will not let the mistake be taken back: it refuses to
republish a version and restricts deleting one.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]


def main(argv: list[str]) -> int:
    if len(argv) != 1:
        print("usage: check_release.py <tag>", file=sys.stderr)
        return 2

    tag = argv[0]
    manifest = json.loads((PROJECT_ROOT / "package.json").read_text())
    version = manifest["version"]
    expected = f"v{version}"

    if tag != expected:
        print(
            f"tag {tag!r} does not name the version in package.json "
            f"({version!r}); expected {expected!r}",
            file=sys.stderr,
        )
        return 1

    print(f"{tag} names package.json's version {version}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))

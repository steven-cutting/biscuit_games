"""Assert a release tag names the version `package.json` and `CHANGELOG.md` carry.

The tag is the version's only claim to be that version, and the changelog is the only
thing a consumer reads to decide whether to take the bump. A tag that disagrees with the
manifest publishes one number under another name; a version the changelog does not name
publishes a bump nobody can judge. GitHub Packages will not let either mistake be taken
back: it refuses to republish a version and restricts deleting one.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]

# `## [0.1.0] - 2026-09-03`, and the `## [Unreleased]` the file also carries. The
# brackets are Keep a Changelog's and are optional here, so an unbracketed heading
# somebody typed by hand still counts. Anchored to `##` so a `### Added` beneath one
# can never satisfy it, and matched whole so `0.1.10` does not answer for `0.1.1`.
HEADING = re.compile(r"^##\s+\[?(?P<name>[^\]\s]+)\]?", re.MULTILINE)


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

    changelog = (PROJECT_ROOT / "CHANGELOG.md").read_text()
    named = [match["name"] for match in HEADING.finditer(changelog)]
    if version not in named:
        print(
            f"CHANGELOG.md has no heading naming {version!r}; it names "
            f"{', '.join(named) or 'nothing'}. Move the [Unreleased] entry under a "
            f"'## [{version}] - <date>' heading before tagging.",
            file=sys.stderr,
        )
        return 1

    print(f"{tag} names package.json's version {version}, and CHANGELOG.md describes it.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))

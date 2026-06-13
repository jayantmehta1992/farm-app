#!/usr/bin/env bash
# setup-github.sh — configures a repository ruleset on GitHub so that
# CI checks must pass before any open PR can be merged, regardless of
# source or target branch. Direct pushes to branches are NOT blocked.
#
# Requires: gh CLI installed and logged in (gh auth login).
# Requires: public repo or GitHub Pro (for rulesets).
#
# Usage:
#   bash scripts/setup-github.sh

set -euo pipefail

REPO="jayantmehta1992/farm-app"

# Delete any existing ruleset with the same name to allow re-running safely.
EXISTING_ID=$(gh api "repos/$REPO/rulesets" --jq '.[] | select(.name == "Require CI on all pull requests") | .id' 2>/dev/null || true)
if [ -n "$EXISTING_ID" ]; then
  echo "Removing existing ruleset (id: $EXISTING_ID)..."
  gh api --method DELETE "repos/$REPO/rulesets/$EXISTING_ID"
fi

echo "Applying repository ruleset to $REPO..."

gh api \
  --method POST \
  "repos/$REPO/rulesets" \
  --header "Accept: application/vnd.github+json" \
  --input - <<EOF
{
  "name": "Require CI on all pull requests",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["~ALL"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "required_status_checks": [
          { "context": "Build backend image" },
          { "context": "Build frontend image" }
        ]
      }
    }
  ]
}
EOF

echo ""
echo "Done. Ruleset is now active on ALL branches."
echo ""
echo "Rules applied:"
echo "  - Direct pushes to any branch: allowed"
echo "  - PR merge button: blocked until CI passes"
echo "    - 'Build backend image' must pass"
echo "    - 'Build frontend image' must pass"

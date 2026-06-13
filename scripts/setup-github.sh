#!/usr/bin/env bash
# setup-github.sh — configures a repository ruleset on GitHub so that
# CI checks must pass before ANY pull request can be merged, regardless
# of the source or target branch.
#
# Uses GitHub's Rulesets API (newer than classic branch protection) which
# supports the "~ALL" pattern to match every branch in one rule.
#
# Run once after creating the repo, or re-run to update the rules.
# Requires: gh CLI installed and logged in (gh auth login).
#
# Usage:
#   bash scripts/setup-github.sh

set -euo pipefail

REPO="jayantmehta1992/farm-app"

echo "Applying repository ruleset to $REPO..."
echo "Target: ALL branches (any source → any target)"

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
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
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
echo "  - PR required before merging (any branch)"
echo "  - 'Build backend image' CI check must pass"
echo "  - 'Build frontend image' CI check must pass"
echo "  - Branch must be up to date before merging"

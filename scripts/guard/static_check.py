#!/usr/bin/env python3
"""PR guard, part 1: rules that can be checked from the diff alone (owner, 19 Nov 2026).

  python3 scripts/guard/static_check.py --base origin/main [--approved]

--approved is set by CI when the PR carries the label "owner-approved"; it only unlocks rule G2 (locked files) and G4
(Version 1). Every other rule always applies. Exit code 1 when a rule fails; the report is printed as Markdown.

G1  wide/ and mobile/ are generated. A PR that changes them must also change their sources in the lab
    (output/element-lab/grid-plan/ or scripts/build-wide.py for wide/, output/element-lab/adaptive/ for mobile/),
    and the phone layer and the shared footer must be in sync with their sources.
G2  Locked files (scripts/guard/locked.txt) hold approved global rules: changing them needs the owner's label.
G3  No forced overrides: a selector that repeats the same id (#faq#faq) exists only to beat approved rules.
G4  index.html is Version 1 and stays as it is unless the owner asks.
"""
import argparse, fnmatch, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GUARD = os.path.dirname(os.path.abspath(__file__))   # the rules come from here (CI runs main's copy, so a PR cannot loosen them)


def git(*a):
    return subprocess.run(['git', *a], cwd=ROOT, capture_output=True, text=True, check=True).stdout


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base', default='origin/main')
    ap.add_argument('--head', default='HEAD')
    ap.add_argument('--approved', action='store_true')
    ap.add_argument('--repo', default=None, help='checkout to check (default: the one this script is in)')
    o = ap.parse_args()
    global ROOT
    ROOT = os.path.abspath(o.repo) if o.repo else ROOT
    rng = f'{o.base}...{o.head}'
    changed = [f for f in git('diff', '--name-only', rng).split('\n') if f]
    fails, notes = [], []

    # G1 · generated layers
    def touched(prefixes):
        return [f for f in changed if any(f.startswith(p) for p in prefixes)]
    wide, wide_src = touched(['wide/']), touched(['output/element-lab/grid-plan/', 'scripts/build-wide.py'])
    mob, mob_src = touched(['mobile/']), touched(['output/element-lab/adaptive/', 'scripts/sync-mobile.py'])
    if wide and not wide_src:
        fails.append(('G1', 'wide/ was edited by hand: ' + ', '.join(wide[:6]),
                      'Edit the sources in output/element-lab/grid-plan/ and run python3 scripts/build-wide.py --only <page>.'))
    if mob and not mob_src:
        fails.append(('G1', 'mobile/ was edited by hand: ' + ', '.join(mob[:6]),
                      'Edit output/element-lab/adaptive/ and run python3 scripts/sync-mobile.py.'))
    if o.head == 'HEAD':   # the sync checks read the working tree, so they only run on the checked-out head
        for script in ('sync-mobile.py', 'sync-footer.py'):
            r = subprocess.run([sys.executable, os.path.join('scripts', script), '--check'], cwd=ROOT, capture_output=True, text=True)
            if r.returncode:
                last = ((r.stdout + r.stderr).strip().splitlines() or ['(no output)'])[-1][:200]
                fails.append(('G1', f'{script} --check failed: {last}', f'Run python3 scripts/{script} and commit the result.'))

    # G2 · locked files
    pats = [l.strip() for l in open(os.path.join(GUARD, 'locked.txt')) if l.strip() and not l.startswith('#')]
    locked = [f for f in changed if any(fnmatch.fnmatch(f, p) for p in pats)]
    if locked and not o.approved:
        fails.append(('G2', 'locked files changed: ' + ', '.join(locked),
                      'These hold approved global rules. Ask the owner; the owner adds the label "owner-approved" if it is right.'))
    elif locked:
        notes.append("G2: locked files changed with the owner's label: " + ', '.join(locked))

    # G3 · forced overrides in added lines (.css, and <style>/inline CSS in .html and .js)
    rep = re.compile(r'#([A-Za-z][\w-]*)#\1\b')
    hits = []
    for f in changed:
        if not f.endswith(('.css', '.html', '.js')) or f.startswith(('output/', 'scripts/guard/')):
            continue
        for line in git('diff', '-U0', rng, '--', f).split('\n'):
            if line.startswith('+') and not line.startswith('+++'):
                m = rep.search(line)
                if m:
                    hits.append(f'{f}: {m.group(0)}')
    if hits:
        fails.append(('G3', 'forced overrides (repeated id): ' + '; '.join(sorted(set(hits))[:8]),
                      'Do not out-shout approved rules. Change the rule at its source (lab file or token) instead.'))

    # G4 · Version 1
    if 'index.html' in changed and not o.approved:
        fails.append(('G4', 'index.html (Version 1) changed', 'Version 1 stays as it is unless the owner asks.'))

    print('## PR guard · static rules\n')
    print(f'{len(changed)} files changed against {o.base}.\n')
    if not fails:
        print('✅ All static rules pass (G1 generated layers, G2 locked files, G3 forced overrides, G4 Version 1).')
    for rule, what, fix in fails:
        print(f'- ❌ **{rule}** {what}\n  - How to fix: {fix}')
    for n in notes:
        print(f'- ℹ️ {n}')
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())

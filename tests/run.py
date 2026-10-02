#!/usr/bin/env python3
"""Run headless logic tests against dist/pond.html (build first: python3 build.py).

usage: python3 tests/run.py [tests/longrun.js ...]   (default: every tests/*.js)
Each test is an expression evaluated in the page; it drives the simulation with
__pond.tick(n) (logic only, no rendering) and returns a JSON summary, which is
saved to tests/out/<name>.json. Each test gets a fresh page.
"""
import json, pathlib, subprocess, sys

here = pathlib.Path(__file__).parent
root = here.parent
files = [pathlib.Path(a) for a in sys.argv[1:]] or sorted(here.glob('*.js'))
(here / 'out').mkdir(exist_ok=True)
for f in files:
    out = here / 'out' / (f.stem + '.json')
    script = json.dumps([['step', 2], ['jsfile', f.read_text(), str(out)]])
    r = subprocess.run([sys.executable, str(root / 'test.py'), '--timeout', '1500', '--script', script],
                       capture_output=True, text=True)
    errs = [l for l in r.stdout.splitlines() if 'pageerror' in l or 'Error' in l and 'ERR_FAILED' not in l]
    res = out.read_text() if out.exists() else '(no result)'
    print(f'== {f.name}: {res[:400]}')
    for e in errs[:5]:
        print('   ', e)

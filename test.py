#!/usr/bin/env python3
"""Headless test/capture harness for dist/pond.html.

usage: python3 test.py [--size 960x540] [--quality high] [--script JSON] [--timeout 600]
script items:
  ["step", n]              advance n fixed frames (dt = 1/fps)
  ["shot", "file.png"]     screenshot of the page
  ["canvas", "file.png"]   screenshot of the canvas only
  ["js", "expr"]           evaluate JS in page (prints result)
  ["cmd", name, ...args]   window.__pond.cmd(name, ...args)
  ["video", dir, frames]   step+save every frame as dir/f00000.png
"""
import asyncio, json, argparse, pathlib, time, sys, base64

ROOT = pathlib.Path(__file__).parent
SKEL = ('<!doctype html><html lang="ja"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);'
        'padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui;'
        'background:#fafaf8}img{max-width:100%}[hidden]{display:none!important}</style></head><body>')


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--size', default='960x540')
    ap.add_argument('--quality', default='high')
    ap.add_argument('--script', default='[["step",30],["shot","shots/a.png"]]')
    ap.add_argument('--opts', default='{}')
    ap.add_argument('--timeout', type=int, default=900)
    ap.add_argument('--dpr', type=float, default=1.0)
    a = ap.parse_args()
    W, H = map(int, a.size.split('x'))
    html = SKEL + (ROOT / 'dist/pond.html').read_text() + '</body></html>'
    three = (ROOT / 'three.module.min.js').read_bytes()
    opts = {'capture': True, 'quality': a.quality}
    opts.update(json.loads(a.opts))
    script = json.loads(a.script)
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader',
                                          '--ignore-gpu-blocklist', '--enable-webgl'])
        ctx = await b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=a.dpr)
        page = await ctx.new_page()
        page.set_default_timeout(a.timeout * 1000)
        logs = []
        page.on('console', lambda m: logs.append(f'[{m.type}] {m.text}'))
        page.on('pageerror', lambda e: logs.append(f'[pageerror] {e}'))

        async def route(r):
            url = r.request.url
            if 'cdn.jsdelivr.net/npm/three' in url:
                await r.fulfill(status=200, body=three, headers={
                    'content-type': 'application/javascript', 'access-control-allow-origin': '*'})
            elif url.startswith('https://pond.test/'):
                await r.fulfill(status=200, body=html, headers={'content-type': 'text/html; charset=utf-8'})
            else:
                await r.abort()
        await page.route('**/*', route)
        await page.add_init_script(f'window.__POND_OPTS = {json.dumps(opts)};')
        t0 = time.time()
        await page.goto('https://pond.test/index.html')
        try:
            await page.wait_for_function('window.__pond && (window.__pond.ready === true || window.__pond.error)',
                                         timeout=a.timeout * 1000)
        except Exception as e:
            print('wait failed', e)
        err = await page.evaluate('window.__pond && window.__pond.error')
        print(f'ready in {time.time()-t0:.1f}s  error={err}')
        for item in script:
            kind = item[0]
            t1 = time.time()
            if kind == 'step':
                await page.evaluate(f'window.__pond.step({item[1]})')
                print(f'step {item[1]}: {time.time()-t1:.1f}s')
            elif kind == 'shot':
                await page.screenshot(path=str(ROOT / item[1]))
                print('shot', item[1])
            elif kind == 'canvas':
                await page.locator('#scene').screenshot(path=str(ROOT / item[1]))
                print('canvas', item[1])
            elif kind == 'js':
                r = await page.evaluate(item[1])
                print('js ->', json.dumps(r)[:2000])
            elif kind == 'jsfile':
                r = await page.evaluate(item[1])
                pathlib.Path(item[2]).write_text(r if isinstance(r, str) else json.dumps(r))
                print('jsfile ->', item[2])
            elif kind == 'cmd':
                r = await page.evaluate(f'window.__pond.cmd(...{json.dumps(item[1:])})')
                print('cmd', item[1:], '->', r)
            elif kind == 'video':
                d = ROOT / item[1]
                d.mkdir(parents=True, exist_ok=True)
                n = item[2]
                start = item[3] if len(item) > 3 else 0
                for i in range(start, n):
                    await page.evaluate('window.__pond.step(1)')
                    data = await page.evaluate('window.__pond.grab()')
                    (d / f'f{i:05d}.jpg').write_bytes(base64.b64decode(data.split(',')[1]))
                    if i % 10 == 0:
                        print(f'frame {i}/{n} {time.time()-t1:.0f}s', flush=True)
        errs=[l for l in logs if 'ERROR' in l or 'pageerror' in l or 'Error' in l]
        for l in errs[:12]:
            m=[x for x in l.split('\n') if 'ERROR' in x or 'Error' in x or 'pageerror' in x]
            print('\n'.join(m[:8])); print('---')
        print('\n'.join([l[:300] for l in logs if 'useProgram' not in l][-25:]))
        await b.close()

asyncio.run(main())

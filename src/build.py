# 九界鐵匠 建置腳本：把 src/ 的 style.css、skin.js、game.js 嵌進 index.template.html，輸出到 repo 根目錄的 index.html（GitHub Pages 直接用）
# 用法：在 repo 根目錄執行  python3 src/build.py
import os,re,json,shutil
S=os.path.dirname(os.path.abspath(__file__));R=os.path.dirname(S)
rd=lambda n:open(os.path.join(S,n),encoding='utf-8').read()
t=rd('index.template.html')
t=t.replace('<!--STYLE-->',rd('style.css').rstrip(),1)   # style.css 本身就包含 <style>…</style>
t=t.replace('<!--SCRIPT-->','<script>\n'+rd('skin.js')+'\n'+rd('game.js')+'\n</script>\n<script>start();</script>',1)
head='<!doctype html>\n<html lang="zh-Hant-TW"><head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="theme-color" content="#0f0c09">\n'
open(os.path.join(R,'index.html'),'w',encoding='utf-8').write(head+t)
for f in ('tests.js','sw.js'):shutil.copy(os.path.join(S,f),os.path.join(R,f))
v=re.search(r"const BUILD_ID='([^']+)'",rd('game.js')).group(1)
open(os.path.join(R,'version.json'),'w').write(json.dumps({'v':v}))
print('built v'+v)

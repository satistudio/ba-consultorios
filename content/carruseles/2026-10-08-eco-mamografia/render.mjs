import {chromium} from '/tmp/claude-0/-home-user-ba-consultorios/bbd5360d-068b-5c0e-8e8d-6f7028ba941f/scratchpad/build/node_modules/playwright-core/index.mjs';
import path from 'path';
const dir=path.dirname(new URL(import.meta.url).pathname);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const ident of [false,true]){
  const pg=await b.newPage({viewport:{width:1080,height:1350}});
  await pg.goto('file://'+dir+'/carrusel.html'); await pg.evaluate(()=>document.fonts.ready);
  if(ident) await pg.evaluate(()=>document.body.classList.add('ident'));
  for(let i=1;i<=5;i++) await pg.locator('#p'+i).screenshot({path:`${dir}/png/${ident?'identificada':'limpia'}-0${i}.png`});
}
await b.close();

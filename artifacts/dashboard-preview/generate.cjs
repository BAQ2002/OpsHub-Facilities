const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const cache = new Map();
function load(file) {
  file=path.resolve(file);
  if(cache.has(file)) return cache.get(file);
  const mod={exports:{}};
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
  function localRequire(name) {
    if(name.includes('useAutomaticFilters')) return {useAutomaticFilters:(filters,data)=>({filters,data,update:()=>{},isPending:false,error:null})};
    if(name==='../actions') return {filterActivityTracking:()=>{}};
    if(name==='next/link') return {__esModule:true,default:({children,...props})=>React.createElement('a',props,children)};
    if(name.startsWith('@/')) {const base=path.resolve(name.slice(2));return load(fs.existsSync(base+'.tsx')?base+'.tsx':base+'.ts');}
    return require(name);
  }
  new Function('require','module','exports',code)(localRequire,mod,mod.exports);
  cache.set(file,mod.exports);
  return mod.exports;
}
async function main(){
const {ActivityTrackingDashboard}=load('app/pages/chamados/dashboard/_components/ActivityTrackingDashboard.tsx');
const summaryCards=[
 ['Chamados criados (todos)','128','Criados no intervalo selecionado','teal'],
 ['Chamados concluídos','76','Concluídos entre os criados no período','lime'],
 ['Chamados em aberto','18','Aguardando início do atendimento','orange'],
 ['Chamados em atendimento','22','Equipes acionadas','sky'],
 ['Chamados cancelados','7','Cancelados entre os criados no período','rose'],
].map(([label,value,detail,color])=>({label,value,detail,color:`text-${color}-600`,bg:`bg-${color}-50`}));
const data={summaryCards,averageHandlingMinutes:145,averageStartMinutes:78,categoryData:[{label:'Refrigeração',value:48,color:'#1CA2C1'},{label:'Elétrica',value:45,color:'#FFD21A'},{label:'PMOC',value:35,color:'#6540A4'}],statusData:[{label:'Em aberto',value:18,color:'#f97316'},{label:'Programada',value:5,color:'#8b5cf6'},{label:'Em andamento',value:22,color:'#0ea5e9'},{label:'Concluída',value:76,color:'#84cc16'},{label:'Cancelada',value:7,color:'#e11d48'}],monthlyData:[{month:'Set',open:45,closed:83}],maxMonthlyValue:83,filterOptions:{businesses:[],serviceCategories:[]}};
const markup=renderToStaticMarkup(React.createElement(ActivityTrackingDashboard,{initialData:data,initialFilters:{startDate:'2026-01-01',endDate:'2026-09-23'}}));
const postcss=require('postcss');
const result=await postcss([require('@tailwindcss/postcss')()]).process(fs.readFileSync('app/globals.css','utf8'),{from:path.resolve('app/globals.css')});
fs.writeFileSync('artifacts/dashboard-preview/index.html',`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Prévia · Dashboard</title><style>${result.css}</style><body><div style="padding:10px 36px;background:#f0fdfa;color:#0f766e;font:13px Arial">Prévia visual · Dados ilustrativos · Filtros sem interação</div>${markup}</body></html>`);
console.log('Preview generated');
}
main().catch(e=>{console.error(e);process.exitCode=1});

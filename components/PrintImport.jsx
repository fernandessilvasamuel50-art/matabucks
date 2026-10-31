import React,{useEffect,useRef,useState} from 'react';
import {Upload,ScanLine} from 'lucide-react';
import {parseMatchText,mergePrints} from '../lib/ocr.js';
export default function PrintImport({onExtract}){
  const [status,setStatus]=useState(''),[results,setResults]=useState(null),[busy,setBusy]=useState(false),alive=useRef(true),workerRef=useRef(null);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;workerRef.current?.terminate().catch(()=>{});};},[]);
  async function extract(event){
    const files=[...event.target.files];event.target.value='';
    if(!files.length)return;
    if(files.length>4||files.some(f=>!['image/png','image/jpeg','image/webp'].includes(f.type)||f.size>8*1024*1024)){setStatus('Selecione até 4 imagens PNG, JPG ou WebP de até 8 MB cada.');return;}
    setBusy(true);setResults(null);setStatus('Preparando leitura…');onExtract({});let worker;
    try{
      const {createWorker}=await import('tesseract.js');
      worker=await createWorker('por+eng',1,{logger:m=>{if(alive.current&&m.status==='recognizing text')setStatus('Lendo print… '+Math.round(m.progress*100)+'%');}});workerRef.current=worker;
      const parsed=[];for(const file of files){
        const bitmap=await createImageBitmap(file);if(bitmap.width*bitmap.height>20000000){bitmap.close();throw Error('A imagem é grande demais. Envie o print original do celular.');}bitmap.close();
        const {data}=await worker.recognize(file);parsed.push({...parseMatchText(data.text),confidence:data.confidence});
      }
      const merged=mergePrints(parsed);
      if(alive.current){setResults({...merged,lowConfidence:parsed.some(p=>p.confidence<65)});onExtract(merged.fields);setStatus('Leitura concluída. Revise cada campo antes de salvar.');}
    }catch(error){if(alive.current)setStatus('Não foi possível ler o print. Você pode preencher a partida ou enviá-lo ao ChatGPT.');}
    finally{if(worker)await worker.terminate().catch(()=>{});workerRef.current=null;if(alive.current)setBusy(false);}
  }
  return <div className="print-import"><label className={'secondary-action upload-action'+(busy?' is-busy':'')}><Upload size={16}/>{busy?'Lendo imagens…':'Ler prints da mesma partida'}<input type="file" accept="image/png,image/jpeg,image/webp" multiple disabled={busy} onChange={extract}/></label><p>Até 4 prints da mesma partida. A leitura ocorre no seu dispositivo; as imagens não são publicadas. Medalhas e data precisam da sua conferência.</p>{status&&<p role="status"><ScanLine size={14}/>{status}</p>}{results?.conflicts.length>0&&<p className="entry-warning">Os prints divergem em: {results.conflicts.join(', ')}. Esses campos ficaram em branco.</p>}{results?.lowConfidence&&<p className="entry-warning">A imagem tem baixa legibilidade. Confira os valores com atenção.</p>}</div>;
}

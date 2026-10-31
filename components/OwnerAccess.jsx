import React,{createContext,useContext,useEffect,useState} from 'react';
const Context=createContext({configured:false,authenticated:false});
export function OwnerProvider({children}){
  const [state,setState]=useState({configured:false,authenticated:false});
  useEffect(()=>{let alive=true;const sync=()=>fetch('/api/events',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(s=>{if(alive&&s)setState(s);}).catch(()=>{});sync();window.addEventListener('focus',sync);return()=>{alive=false;window.removeEventListener('focus',sync);};},[]);
  return <Context.Provider value={state}>{children}</Context.Provider>;
}
export const useOwner=()=>useContext(Context);
export function OwnerLogin(){const state=useOwner();return state.authenticated?<a className="quiet-link" href="/api/auth/signout">Sair da conta</a>:state.configured?<a className="quiet-link" href="/api/auth/signin">Entrar para salvar</a>:null;}

import {get} from "@vercel/global-config";
export default async function handler(req,res){
 if(req.method!=="GET"){res.setHeader("Allow","GET");return res.status(405).json({error:"method_not_allowed"})}
 try{const data=await get("tracker");if(!data||typeof data.score!=="number")return res.status(503).json({error:"tracker_unavailable"});res.setHeader("Cache-Control","public,max-age=0,s-maxage=5,stale-while-revalidate=30");return res.status(200).json(data)}
 catch(e){console.error("Global Config read failed",e?.message);return res.status(503).json({error:"tracker_unavailable"})}
}
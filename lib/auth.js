import {getToken} from '@auth/core/jwt';
import GitHub from '@auth/core/providers/github';
import {OWNER} from './tracker.js';
export const OWNER_ID = 234553185;
export const productionOrigin = 'https://matabuks-samira-fernandessilvasamuel50-arts-projects.vercel.app';
export const authOrigin = () => process.env.AUTH_ORIGIN || productionOrigin;
export const authConfigured = () => !!(process.env.AUTH_SECRET && process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);
export function authConfig() {
  return {basePath:'/api/auth',trustHost:true,secret:process.env.AUTH_SECRET,
    useSecureCookies:authOrigin().startsWith('https:'),session:{strategy:'jwt',maxAge:8*3600},
    providers:[GitHub({clientId:process.env.AUTH_GITHUB_ID,clientSecret:process.env.AUTH_GITHUB_SECRET,
      authorization:{params:{scope:'read:user public_repo'}},checks:['state','pkce']})],
    callbacks:{
      signIn({profile}){return profile?.id===OWNER_ID&&profile?.login?.toLowerCase()===OWNER;},
      jwt({token,account,profile}){if(account){token.accessToken=account.access_token;token.providerExpires=account.expires_at;token.ownerId=profile.id;token.login=profile.login;}return token;},
      session({session,token}){session.user={name:token.login};return session;},
      redirect({url}){return url.startsWith(authOrigin()+'/')?url:authOrigin();}
    },
    logger:{error(error){console.error('Authentication failed',error.type||'auth_error');},warn(code){console.warn('Authentication',code);},debug(){}}
  };
}
export async function ownerSession(req) {
  if(!authConfigured())return null;
  // Only encrypted HttpOnly cookies are accepted. Arbitrary bearer credentials are not sessions.
  const token=await getToken({req:{headers:{cookie:req.headers.cookie||''}},secret:process.env.AUTH_SECRET,secureCookie:authOrigin().startsWith('https:')});
  if(token?.ownerId!==OWNER_ID||token.login?.toLowerCase()!==OWNER||!token.accessToken||(token.providerExpires&&token.providerExpires*1000<Date.now()))return null;
  return token;
}
export function sameOrigin(req){return req.headers.origin===authOrigin()&&(!req.headers['sec-fetch-site']||req.headers['sec-fetch-site']==='same-origin');}

import { serve } from "https://deno.land/std/http/server.ts";
import "https://deno.land/std/dotenv/load.ts";

let resp;

const service = async (ext, pathname, req) => {
  resp = null;
  if (!resp) {
    for (const element of ext) {
      const _resp = await element(pathname, req);
      if (_resp) {
        resp = _resp;
        break;
      }
    }
  }
};

const middleware = async (request, info) => {
<<<<<<< HEAD
  const { pathname } = new URL(request.url);
  window.extPath = window?._cwd ? window._cwd : Deno.cwd();

  try {
    const extensions = Deno.env.get("env")
      ? await import(`${window.extPath}/extensions.js`)
      : await import(`${window.extPath}/ext.js`);
    await service(Object.values(extensions), pathname, request);
    return resp;
  } catch (err) {
    window.dispactLog
      ? window.dispatchLog({ msg: err.message, err })
      : console.log(err);
    return Response.json({ msg: "Error:LEVEL1" }, { status: 500 });
  }
};
=======
  
        const { pathname } = new URL(request.url);
        window.extPath = window?._cwd ? window._cwd: Deno.cwd() 
  
        if(!isAuthenticated(request)){

            const {pathname} = new URL(request.url)
            
     
            const {default:app} = await import('app.sauveur.dev/index.js')
            const appReq = new Request(`https://app.sauver.xyz/account?redirect=${request.headers.get('host')}`,{
                headers:{
                    host: 'app.sauver.xyz'
                }
            })
 
            window._cwd = 'app.sauveur.dev'
            if(pathname !== '/'){
             
                return app(request)
            }


            return app(appReq)
            // return Response.redirect(`https://${Deno.env.get('env') ? 'app-sauveur.localhost:9001/account?redirect=dash-sauveur.localhost:9001' : 'app.sauveur.xyz/account?redirect=dash.sauveur.xyx'} `)
            // // return new Response(null,{
            // //     status: 401,
            // //     headers: {
            // //         'WWW-Authenticate': 'Basic realm="Access to staging site"'
            // //     }
            // // })
        }
>>>>>>> a4cdd34 (they might be changes)

if (import.meta.main) {
  const port = 9090;
  serve(middleware, { port });
}

export default middleware;

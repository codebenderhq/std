import {serve} from "https://deno.land/std@0.167.0/http/server.ts";
import "https://deno.land/std/dotenv/load.ts";

let resp;

const service = async (ext, pathname, req) => {
    resp = null
    if(!resp){
        for (const element of ext) {

            const _resp = await element(pathname, req)
            if(_resp){
                resp = _resp
                break;
            } 
        }
    }
  
}

const middleware = async (request, info) => {
      try {
        
        const { pathname } = new URL(request.url);
        window.extPath = window._cwd ? window._cwd: Deno.cwd() 
   
        try{ 
            
            const extensions = Deno.env.get('env') ? await import(`${window.extPath}/extensions.js`) : await import(`${window.extPath}/ext.js`)
            await service(Object.values(extensions),pathname,request)
            return resp
        }catch(err){
        
        console.log(err)
          throw Error(err.message)
        }
  
   
      
      } catch (err) {
          // look into support for logging service or build own
          // we will send it from here to our custom logger
          let msg = "Internal server error";
      
          // if (err.message.includes("Cannot read properties of undefined ")) {
          //   msg = err.message;
          // }
      
          return Response.json({msg, trace:err.message},{status:500})
      }
}


// const port = 9090
// serve(middleware, { port });

export default middleware
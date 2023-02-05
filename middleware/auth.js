import { getCookies } from "https://deno.land/std/http/cookie.ts";


const getAuthToken = (req) => {
    const { id } = getCookies(req.headers);
  
    return id
};

const isAuthenticated = (req) => {
    const id = getAuthToken(req);
   
    return id ? true : false;
};




window.space = {
    getAuthToken
}

const authenticate = (pathname,request) => {
    if (!isAuthenticated(request)) {
        console.log(Deno.env.get("env"));
        return Response.redirect(
          `https://${
            Deno.env.get("env")
              ? "localhost:9001/account?domain=app.sauveur&redirect=localhost:9001?domain=dash.sauveur"
              : "app.sauveur.xyz/account?redirect=dash.sauveur.xyx"
          } `,
        );
        // return new Response(null,{
        //     status: 401,
        //     headers: {
        //         'WWW-Authenticate': 'Basic realm="Access to staging site"'
        //     }
        // })
      }
}

export default authenticate
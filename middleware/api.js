import { getCookies } from "https://deno.land/std/http/cookie.ts";


const valid_domain = (referer) => {
  // need to handle valid domain better as a person could just read the code and figure out what refer to use
  return ["sauveur.xyz", "http://localhost:8080/", "mmereko.co.za"].includes(
    referer,
  );
};

const is_authenticated = (auth) => {
  return [Deno.env.get("SERVER_KEY")].includes(auth);
};

const get_data = async (request) => {
  let _data = {};
  let type = "json";
  const referer = request.headers.get("referer");
  const isFormReq = request.headers.get("content-type") ===
    "application/x-www-form-urlencoded";
  const isBlob =
    request.headers.get("content-type") === "application/octet-stream";

  if (isFormReq && referer) {
    let referer = new URL(request.headers.get("referer"));
    let data = new URLSearchParams(await request.text());

    for (const key of data.keys()) {
      const value = data.get(key);
      if (value !== "") {
        _data[key] = value;
      }
    }

    // for (var key of referer.searchParams.keys()) {
    //   data.set(key, referer.searchParams.get(key));
    // }

    type = "form";
  } else if (isFormReq && !referer) {
    throw new Error("Form request require referer");
  } else if (isBlob) {
    _data = await request.blob();
    type = "blob";
  } else {
    _data = await request.json();
  }

  return { result: _data, type };
};

const api_middleware = async (pathname, request) => {
  const { id } = getCookies(request.headers);
  const isFormType =
    request.headers.get("content-type") === "application/x-www-form-urlencoded";
  const isApiCall = pathname.includes("api") ||
    request.headers.get("host").includes("api");
  if (isApiCall || isFormType) {
    let response;
    try {
      let data = {};
      const auth = request.headers.get("authorization");
      const host = request.headers.get("host");
      const referer = request.headers.get("referer");
      const paths = pathname.split("/");
      let subPath = "";
      if (paths.length > 3) {
        paths.pop();
      }

      const apiPath = `${paths.reverse().join("/")}${subPath}`;
 
      // added server cors
      if ((!is_authenticated(auth) && !isFormType) && !id) {
        throw new Error("Unotharized");
      }

      if (request.method !== "GET") {
        data = await get_data(request);
      }

      const { default: apiMethod } = await import(
        `${window.extPath}/src/_app/${apiPath}${request.method.toLowerCase()}.js`
      );
      const json = await apiMethod(request, data.result);

      const status = json.status;
      delete json.status;

      if (request.method === "POST") {
        const returnPath = json.uri;
        const redirectHost = json.redirect;
        const origin = request.headers.get("origin");
        delete json.redirect;
        delete json.uri;
        delete json.body;
        delete json.status;
        const searchParam = new URLSearchParams(json);

        
        const Location = `${redirectHost ? `https://${redirectHost}` : origin}${
          returnPath ? returnPath : "/status"
        }?${searchParam.toString()}`;

        const headers = {
          Location,
          'set-cookie': json?.setCookie ? `id=${json.auth};Secure;HttpOnly;SameSite=Lax;Path=/`: null,
        }

        // return Response.redirect(Location)
        // convert this to jsx for customizability
        //             'Access-Control-Allow-Origin': `${isFormType ? 'app.sauveur.xyz' : '*' }`

        // : {
        //   Location,
        //   "Access-Control-Allow-Origin": `${
        //     isFormType ? "app.sauveur.xyz" : "*"
        //   }`,
        // },
        return Response.json(json, {
          status: 303,
          headers
        });
      }

      response = Response.json(json, {
        status,
      });
    } catch (err) {
      // log();
      const _err = {
        title: `SERVER:API:ERROR:${request.url}`,
        msg: err.message,
        err,
      };
      console.log(_err)
      // window.dispatchLog({ ..._err });
      throw new Error(`SERVER:API:ERROR:${request.url}:${err.message}`);
    }

    return response;
  }
};

export default api_middleware;

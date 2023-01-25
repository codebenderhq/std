 import html from "./html.js";

const valid_domain = (referer) => {
  // need to handle valid domain better as a person could just read the code and figure out what refer to use
  return ['sauveur.xyz','http://localhost:8080/','mmereko.co.za'].includes(referer)
}

const is_authenticated = (auth) => {
  return [Deno.env.get('SERVER_KEY') ].includes(auth)
}

const get_data = async (request) => {
  let _data
  let type = 'json'
  const referer = request.headers.get("referer");
  const isFormReq =
  request.headers.get("content-type") ===
    "application/x-www-form-urlencoded" 
  const isBlob = request.headers.get("content-type") === "application/octet-stream"


  if (isFormReq && referer) {
    let referer = new URL(request.headers.get("referer"));
     _data = new URLSearchParams(await request.text());

    for (const key of _data.keys()) {
      const value = _data.get(key)
      if(value !== ""){
        data[key] = value
      }
    }
   

    for (var key of referer.searchParams.keys()) {
      _data.set(key, referer.searchParams.get(key));
    }
    type='form'
  } 
  else if(isFormReq && !referer){
    throw new Error('Form request require referer')
  }else if(isBlob){
    _data = await request.blob()
    type = 'blob'
  }else{
    _data = await request.json()
  }

  return {result:_data, type}


}

const api_middleware =  async (pathname, request) => {

  const isFormType = request.headers.get("content-type") === 'application/x-www-form-urlencoded' 
  const isApiCall =  pathname.includes('api') || request.headers.get("host").includes('api')
  if (isApiCall || isFormType ) {
    let response;
    try {
      let data ={};
      const auth = request.headers.get("authorization");
      const host = request.headers.get("host");
      const referer = request.headers.get("referer");
      const paths = pathname.split('/')
      let subPath=''
      if(paths.length > 3){
        paths.pop()
      }
    
     
      const apiPath = `${paths.reverse().join('/')}${subPath}`
    
      // added server cors
   
 
      if(!is_authenticated(auth)){
        throw new Error('Unotharized')
      }
  
      if(request.method !== "GET"){
        data = await get_data(request) 
      }
  
      const {default: apiMethod} = await import(`${window.extPath}/src/_app/${apiPath}/${request.method.toLowerCase()}.js`)
      const json = await apiMethod(request,data.result)
  
      const status = json.status
      delete json.status


      if (request.method === 'POST') {
  
        const searchParam = new URLSearchParams(json)
        // convert this to jsx for customizability
        return  Response.json(json,{
          status,
          headers:{
            Location: `https://${host}/status?${searchParam.toString()}`
          }
        });
      }

   
      response = Response.json(json,{
        status
      });
  
      
    } catch (err) {
      // log();
      const _err = {
         title: `SERVER:API:ERROR:${request.url}`,
        msg: err.message,
        err
      }
      window.dispatchLog({..._err})
      throw new Error(`SERVER:API:ERROR:${request.url}`,)
    }
   
    return response
  }
;
};


export default api_middleware
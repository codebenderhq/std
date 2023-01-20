import { exists } from "https://deno.land/std/fs/mod.ts";
import Markdoc from 'npm:@markdoc/markdoc'

const exts = ['html','jsx','md'] 
let isError = false
let _path = `${window._cwd ? window._cwd : '.'}/src/_app`
const errorPath = `${_path}/error/pages/index.html`


const html_middleware = async (pathname, req, path = _path) => {
  
  if(!pathname.includes('.')){
    let paramPage = ''
    let jsxPage = false
    let page;
   
      for (const ext of exts) {
        let _pageSrc = `${path}/index.${ext}`
    
        if(pathname.split('/').length === 2 && pathname !== '/'){
          _pageSrc = `${path}${pathname}/pages/index.${ext}`;
        } else if(pathname !== '/'){ 
          _pageSrc = `${path}${pathname.split('/')[1]}/pages/${pathname.split('/')[2]}.${ext}` 
          paramPage = `${path}${pathname.split('/')[1]}/pages/@.${ext}`;
        }
        
        const isParamAvailible = await exists(paramPage)
        const pageExist = await exists(_pageSrc)
    
        // console.log(pageExist, isParamAvailible,pathname,_pageSrc)
    
        if(!page && pageExist && ext !== 'jsx'){
        
          page = await Deno.readTextFile(pageExist ? _pageSrc : isParamAvailible ? paramPage : set_error() );

          // console.log(_pageSrc)
          if(ext === 'md'){
            // const _md = await Deno.readTextFile(pageExist ? _pageSrc : isParamAvailible ? paramPage : set_error() );
            const ast = Markdoc.parse(page);
            const content = Markdoc.transform(ast);
            page = Markdoc.renderers.html(content)
          }
     
          // until a better soultion is found
          if(pathname === '/'){
            break;
          }
        }
    

    
 

        if(ext === 'jsx' && isError && pageExist || isParamAvailible){
          jsxPage = await import(`../../../${pageExist ? _pageSrc : isParamAvailible ? paramPage : set_error()}`)
        }
      }
    
      if(jsxPage){
        return jsxPage.default()
      }
    
  
    
  
    return html_response(page)
  }

}

const set_error = () => {
  isError = true
  return errorPath

}

export const error_response = () => {
  return html_response(Deno.readFile(errorPath))
}

// redirect to 303 error page
const html_response = (res) => {
  return new Response(res, {
    headers: {
      "content-type": "text/html",
    },
  });
}



export default html_middleware
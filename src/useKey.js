import { useEffect } from "react";

export function useKey(key,functionPass){

    useEffect(function(){
        function callBack(e){
          if(e.code.toLowerCase === key.toLowerCase){
            functionPass()
          }
        }
    
        document.addEventListener( ("keydown"),callBack)
    
        return function(){
          document.removeEventListener(("keydown"),callBack)
        }
      },[functionPass,key])
}
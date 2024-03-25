import { useState,useEffect } from "react";

export function useLocalStorage(initialValue,key){

    const [value, setValue] = useState(function(){
        const item = localStorage.getItem(key);
        return JSON.parse(item) || initialValue;
    });
    
    useEffect(function(){
        localStorage.setItem(key,JSON.stringify(value));
    },[value,key]);

    return [value,setValue];
}

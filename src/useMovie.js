import { useState,useEffect } from "react";

const key = "c25261f4";


export function useMovie(query){

    const [movies, setMovies] = useState([]);
    const [isLoad,setIsLoad]=useState(false);
    const [error,setError]=useState(false);
    
    useEffect(function(){
        
        const controller = new AbortController();
        async function movieRequest(){
            try{
                setError("");
                setIsLoad(true);
                const res = await fetch(`https://www.omdbapi.com/?apikey=${key}&s=${query}`,{signal:controller.signal});
      
                if(!res.ok) throw new Error("something went wrong");
                
                const data = await res.json();
                
                if(data.Response === 'False')
                throw new Error("movie not found");
            
            setMovies(data.Search);
            setIsLoad(false)
            setError("")
            
        }catch(err){
            if(err.name !== "AbortError")
            setError(err.message);
    }finally{
        setIsLoad(false)
    }
    
}
if(query.length < 3){
    setMovies([]);
    setError("");
    return
}

// movieClose();
movieRequest();

return function(){
    controller.abort();
}
},[query]);

return {movies,isLoad,error};
}
import { useEffect, useState } from "react";
import StarComponent from "./StarComponent";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

/*const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];*/

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

  const key = "c25261f4";
  
  export default function App() {
    const [movies, setMovies] = useState(tempMovieData);
    // const [watched, setWatched] = useState([]);
    const [query, setQuery] = useState("");
    const [isLoad,setIsLoad]=useState(false);
    const [error,setError]=useState(false);
    const [selectedId,setSelectedId]=useState(null);
    
    const [watched, setWatched] = useState(function(){
      const item = localStorage.getItem("watched");
      return JSON.parse(item) || [];
    });

    
    function movieSelect(id){
      setSelectedId(selected =>selected===id?null:id);
    }

    
    
    function movieClose(){
      setSelectedId(null);
    }
    function movieDelete(id){
      setWatched(watched.filter((data)=>data.imdbID !== id))
    }
    function watchedList(movie){
      setWatched(data=> [...data,movie]);
      setSelectedId(null);
    }


    useEffect(function(){
      localStorage.setItem("watched",JSON.stringify(watched));
    },[watched]);

    useEffect(function(){
      
      const controller = new AbortController();
      async function movieRequest(){
        try{
          setError("");
          setIsLoad(true);
        const res = await fetch(`http://www.omdbapi.com/?apikey=${key}&s=${query}`,{signal:controller.signal});
        
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

    movieClose();
    movieRequest();

    return function(){
      controller.abort();
    }
  },[query]);
  
  
  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery}/>
        <NumResult movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoad&&<Load />}
          {!isLoad&&!error&&<MoviesList movies={movies} onMovieSelected={movieSelect}/>}
          {error&&<ErrorMsg  message={error}/>}
        </Box>
        <Box>
          {selectedId ? <MovieDetails selectedMovie={selectedId} onMovieClose={movieClose} watchedList={watchedList} watched={watched}/> :
           <>
           <Summary watched={watched} />
           <WatchedMovieList watched={watched} onDelete={movieDelete}/>
           </>
          }
        </Box>
      </Main>
    </>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>)
}

function Logo() {
  return <div className="logo">
    <span role="img">🍿</span>
    <h1>usePopcorn</h1>
  </div>
}

function Search({query,setQuery}) {
  return <input
  className="search"
  type="text"
  placeholder="Search movies..."
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  />
}

function NumResult({movies}) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>)
}

function Load(){
  return(
    <p className="loader">Loading.....</p>
    )
  }
  
  function ErrorMsg({message}){
    return(
      <p className="error">
      <span>⛔{message}</span>
    </p>
  )
}
function Main({ children }) {
  
  return (
    <main className="main">
      {children}
    </main>)
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
        >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>

)
}

// function WatchedBox(){
  //   return(
    //     <div className="box">
    //     <button
    //       className="btn-toggle"
    //       onClick={() => setIsOpen2((open) => !open)}
    //       >
    //       {isOpen2 ? "–" : "+"}
    //     </button>
    //     {isOpen2 && (
      //       <>
      
      //       </>
      //     )}
      //   </div>
      //   )
      // }
 function MovieDetails({selectedMovie,onMovieClose,watchedList,watched}){
        const [movie,setMovie]=useState({});
        const [isLoad,setIsLoad]=useState(false);
        const [userRating,setUserRating]=useState("");
  
const isRated= watched.map((data)=>data.imdbID).includes(selectedMovie);
const preRate = watched.find((movie)=>movie.imdbID===selectedMovie)?.userRating;
    
  const {Title:title,
    imdbRating,
    Year:year
    ,Released:released
    ,Runtime:runtime
    ,Director:director,
    Poster:poster,
    Plot:plot,
    Genre:genre,
    Actors:actors}=movie;
    
    function addMovie(){
      const newMovie={
        imdbID:selectedMovie,
        title,
        year,
        runtime: Number(runtime.split(' ').at(0)),
        poster,
        imdbRating:Number(imdbRating),
        userRating

      }
      watchedList(newMovie);

    }

  useEffect(function(){
    function callBack(e){
      if(e.code === "Escape"){
        onMovieClose()
      }
    }

    document.addEventListener( ("keydown"),callBack)

    return function(){
      document.removeEventListener(("keydown"),callBack)
    }
  },[onMovieClose])

  useEffect( function() {

    async function movieFetch(){
      setIsLoad(true);
      const res = await fetch(`http://www.omdbapi.com/?apikey=${key}&i=${selectedMovie}`);    
      const data = await res.json();
      setIsLoad(false);
      setMovie(data);
    }
    movieFetch();
  },[selectedMovie])

  useEffect(function(){
    if(!title) return;
    document.title=`Movie | ${title}`

    return function(){
      document.title = "usePopcorn"
    }
  },[title])
  return(
    <div className="details">
      {isLoad? <Load />:<>

      <header>

      <button className="btn-back" onClick={onMovieClose}>⬅️</button>

      <img src={poster} alt={`poster of the movie ${title}`}/>

      <div className="details-overview">

        <h2>{title}</h2>
        <p>{released} &bull; {runtime}</p>
        <p>{genre}</p>
        <p><span>⭐</span>
          {imdbRating} IMDB rating</p>

      </div>

      </header>

      <section>

        <div className="rating" >

          {!isRated? <>
        <StarComponent  maxValue={10} size={24} onRate={setUserRating}/>
        {userRating >0&& <button onClick={addMovie} className="btn-add">+ Add to list</button>}
        </>:
        <p>The movie is rated: <span>⭐ {preRate}</span></p>
        }

        </div>


        <p>
          <em>{plot}</em>
        </p>

        <p>Starring {actors}</p>

        <p>Directed by {director}</p>

      </section>
      </>
      }
    </div>
  )
}
function MoviesList({ movies,onMovieSelected }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onMovieSelected={onMovieSelected}/>
      ))}
    </ul>
  )
}

function Movie({ movie ,onMovieSelected}) {
  return (
    <li onClick={()=>onMovieSelected(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}

function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
 
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣{watched.length}</span>
          <span>movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(1)} min</span>
        </p>
      </div>
    </div>
  )
}

function WatchedMovieList({ watched,onDelete }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} onDelete={onDelete}/>
      ))}
    </ul>
  )
}

function WatchedMovie({ movie,onDelete }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button onClick={()=>onDelete(movie.imdbID)} className="btn-delete">X</button>
      </div>
    </li>
  )
}

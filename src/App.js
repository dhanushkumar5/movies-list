import { useEffect,useRef, useState } from "react";
import StarComponent from "./StarComponent";
import { useMovie } from "./useMovie";
import { useLocalStorage } from "./useLocalStorage";
import { useKey } from "./useKey";



const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

  const key = "c25261f4";
  
  export default function App() {
  
    const [query, setQuery] = useState("");
    const [selectedId,setSelectedId]=useState(null);
    const {movies,isLoad,error}=useMovie(query);
    const [watched,setWatched]=useLocalStorage([],"watched")
    
    
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

  
  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery}/>
        <NumResult movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoad&&<Load />}
          {}
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
    <span role="img">🎬</span>
    <h1>moviesToWatch</h1>
  </div>
}

function Search({query,setQuery}) {
const keyValue =useRef(null);
useKey("enter",function(){
  if(document.activeElement === keyValue.current) return;
  keyValue.current.focus();
  setQuery("")
})

  return <input
  className="search"
  type="text" name="search"
  placeholder="Search movies..."
  value={query}
  ref={keyValue}
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
  useKey("escape",onMovieClose);
  
  const isRated= watched.map((data)=>data.imdbID).includes(selectedMovie);
  const preRate = watched.find((movie)=>movie.imdbID===selectedMovie)?.userRating;

  const countRating = useRef(0);

  useEffect(function(){
    if(userRating) countRating.current++;
  },[userRating])
    
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
      userRating,
      ratingCount:countRating.current

    }
watchedList(newMovie);

    }


  useEffect( function() {

    async function movieFetch(){
      setIsLoad(true);
      const res = await fetch(`https://www.omdbapi.com/?apikey=${key}&i=${selectedMovie}`);    
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
      document.title = "moviesToWatch"
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

//$(fuction() is a jquery function it gets called immediately when the DOM is being loaded -->
//below is the short form for $(document).ready(function(){}
$(function() {
  // Button will be disabled until we type anything inside the input field
//autocomplete is the id of the box where we enter the details
  const source = document.getElementById('autoComplete');
//below is a declaration of anonymous function and it is useful coz it is syntatically lighter than a normal function
  const inputHandler = function(e) {
    if(e.target.value==""){
//attr() method is used to return the value of the attribute
//making the input button (enter  your name) so that when disabled the form is not going to be submitted
//. is used to indicate class name and  # is used to indicate id
//.movie-button is a selector if value is null red button that is enter button is disabled if value is entered then enter button is enabled
      $('.movie-button').attr('disabled', true);
    }
    else{
      $('.movie-button').attr('disabled', false);
    }
  }
//source is the const variable we have taken the value of input box through id
//input is an event when input is made by the user
//input event will be called and function input handler will be called
  source.addEventListener('input', inputHandler);

//.movie-button is the class name for the enter button when thwt button is clicked 
 $('.movie-button').on('click',function(){
//my_api_key is my api key

    var my_api_key = '2d29957c3cb6b2651625c54c985e3592';
//val () returns value of the attribute
//$('.movie') this is the way we specify the selector in jquery
    var title = $('.movie').val();
//if the value is empty then  using .css we specify the style property
//.results and .fail is the selector
    if (title=="") {
      $('.results').css('display','none');
      $('.fail').css('display','block');
    }
// if value is not empty load_details function is called with api_key and the title
    else{
      load_details(my_api_key,title);
    }
  });
});

// will be invoked when clicking on the recommended movies
//below the recommend.html page the movies will be revommended if we click on any  of the function 
//load_details will be called with api key and title
function recommendcard(e){
  var my_api_key = '2d29957c3cb6b2651625c54c985e3592';
//get attribute returns the value of the attribte with the specified name of the element
//title is the attribute which is given to each of the div image at the bottom  
var title = e.getAttribute('title'); 
  load_details(my_api_key,title);
}

// get the basic details of the movie from the API (based on the name of the movie)
function load_details(my_api_key,title){
//$.ajax indicates the ajax request
//ajax is a technology to handle asynchronous request to api.
//type - GET indicates that we are getting the data from the url specified at the url
//url - url is specified from where data has to be extracted
  $.ajax({
    type: 'GET',
    url:'https://api.themoviedb.org/3/search/movie?api_key='+my_api_key+'&query='+title,
//success defines what should happen if the request is successful
    success: function(movie){
//if the movie that we specify has length less than 1 the  fail
      if(movie.results.length<1){
        $('.fail').css('display','block');
        $('.results').css('display','none');
        $("#loader").delay(500).fadeOut();
      }
//else  movie.results will have many movies take the first one select the id and movie_title and call function movie_title
      else{
        $("#loader").fadeIn();
        $('.fail').css('display','none');
        $('.results').delay(1000).css('display','block');
        var movie_id = movie.results[0].id;
        var movie_title = movie.results[0].original_title;
        movie_recs(movie_title,movie_id,my_api_key);
      }
    },
//if request is not successful then error part will be called
//saying invalid request
    error: function(){
      alert('Invalid Request');
      $("#loader").delay(500).fadeOut();
    },
  });
}

// passing the movie name to get the similar movies from python's flask
//for recommendation of the movies we have  to send it to flask so we arae using post
//the data that we are sending to flask has to be mentioned in data part
//it has to go /similarity url in flask we are sending name so in main.py it will be recieved as name
function movie_recs(movie_title,movie_id,my_api_key){
  $.ajax({
    type:'POST',
    url:"/similarity",
    data:{'name':movie_title},
    success: function(recs){
//if recs=="sorry .....it is a fail
      if(recs=="Sorry! The movie you requested is not in our database. Please check the spelling or try with some other movies"){
        $('.fail').css('display','block');
        $('.results').css('display','none');
        $("#loader").delay(500).fadeOut();
      }
      else {
        $('.fail').css('display','none');
        $('.results').css('display','block');
//it will send a list of movies split it and put it in an array
        var movie_arr = recs.split('---');
        var arr = [];
        for(const movie in movie_arr){
          arr.push(movie_arr[movie]);
        }
//here get_movie_details is called to get the details of the recommended movie
        get_movie_details(movie_id,my_api_key,arr,movie_title);
      }
    },
    error: function(){
      alert("error recs");
      $("#loader").delay(500).fadeOut();
    },
  }); 
}

// get all the details of the movie using the movie id.
function get_movie_details(movie_id,my_api_key,arr,movie_title) {
  $.ajax({
    type:'GET',
    url:'https://api.themoviedb.org/3/movie/'+movie_id+'?api_key='+my_api_key,
    success: function(movie_details){
//it collects the movie details based on the movie_id it will return the arr of information it will be passed on to show_details
      show_details(movie_details,arr,movie_title,my_api_key,movie_id);
    },
    error: function(){
      alert("API Error!");
      $("#loader").delay(500).fadeOut();
    },
  });
}

// passing all the details to python's flask for displaying and scraping the movie reviews using imdb id
//passing all the information to flask from movie details
//to access each information we are using movie_details.__
function show_details(movie_details,arr,movie_title,my_api_key,movie_id){
  var imdb_id = movie_details.imdb_id;
  var poster = 'https://image.tmdb.org/t/p/original'+movie_details.poster_path;
  var overview = movie_details.overview;
  var genres = movie_details.genres;
  var rating = movie_details.vote_average;
  var vote_count = movie_details.vote_count;
  var release_date = new Date(movie_details.release_date);
  var runtime = parseInt(movie_details.runtime);
  var status = movie_details.status;
  var genre_list = []
//put list of genres in a list
  for (var genre in genres){
    genre_list.push(genres[genre].name);
  }
joining the list
  var my_genre = genre_list.join(", ");
//runtime is length or duration of the movie
//  writing if else loop converting runtime which is in seconds to hours
  if(runtime%60==0){
    runtime = Math.floor(runtime/60)+" hour(s)"
  }
//if only if it is completely divisble
//else first part in hours rest in minutes
  else {
    runtime = Math.floor(runtime/60)+" hour(s) "+(runtime%60)+" min(s)"
  }
  arr_poster = get_movie_posters(arr,my_api_key);
  
  movie_cast = get_movie_cast(movie_id,my_api_key);
  
  ind_cast = get_individual_cast(movie_cast,my_api_key);
//data that is sent to be sent across a server should be string
//so we use stringify function to convert it to string
// then we send the details to flask
  details = {
    'title':movie_title,
      'cast_ids':JSON.stringify(movie_cast.cast_ids),
      'cast_names':JSON.stringify(movie_cast.cast_names),
      'cast_chars':JSON.stringify(movie_cast.cast_chars),
      'cast_profiles':JSON.stringify(movie_cast.cast_profiles),
      'cast_bdays':JSON.stringify(ind_cast.cast_bdays),
      'cast_bios':JSON.stringify(ind_cast.cast_bios),
      'cast_places':JSON.stringify(ind_cast.cast_places),
      'imdb_id':imdb_id,
      'poster':poster,
      'genres':my_genre,
      'overview':overview,
      'rating':rating,
      'vote_count':vote_count.toLocaleString(),
      'release_date':release_date.toDateString().split(' ').slice(1).join(' '),
      'runtime':runtime,
      'status':status,
      'rec_movies':JSON.stringify(arr),
      'rec_posters':JSON.stringify(arr_poster),
  }
// we use this to recommend
  $.ajax({
    type:'POST',
    data:details,
    url:"/recommend",
    dataType: 'html',
    complete: function(){
//loading for some time before displaying the result
      $("#loader").delay(500).fadeOut();
    },
    success: function(response) {
      $('.results').html(response);
      $('#autoComplete').val('');
      $(window).scrollTop(0);
    }
  });
}

// get the details of individual cast
//to get the details of the actors in the movie like the birthday , biography and place of birth

function get_individual_cast(movie_cast,my_api_key) {
    cast_bdays = [];
    cast_bios = [];
    cast_places = [];
    for(var cast_id in movie_cast.cast_ids){
      $.ajax({
        type:'GET',
        url:'https://api.themoviedb.org/3/person/'+movie_cast.cast_ids[cast_id]+'?api_key='+my_api_key,
        async:false,
        success: function(cast_details){
//push it in an array
          cast_bdays.push((new Date(cast_details.birthday)).toDateString().split(' ').slice(1).join(' '));
          cast_bios.push(cast_details.biography);
          cast_places.push(cast_details.place_of_birth);
        }
      });
    }
    return {cast_bdays:cast_bdays,cast_bios:cast_bios,cast_places:cast_places};
  }

// getting the details of the cast for the requested movie
function get_movie_cast(movie_id,my_api_key){
    cast_ids= [];
    cast_names = [];
    cast_chars = [];
    cast_profiles = [];

    top_10 = [0,1,2,3,4,5,6,7,8,9];
    $.ajax({
      type:'GET',
      url:"https://api.themoviedb.org/3/movie/"+movie_id+"/credits?api_key="+my_api_key,
      async:false,
      success: function(my_movie){
//if the cast of a movie is gretaer than 10 then only take first 10
//else take minumum 5 coz minimum 5 casts are there
        if(my_movie.cast.length>=10){
          top_cast = [0,1,2,3,4,5,6,7,8,9];
        }
        else {
          top_cast = [0,1,2,3,4];
        }
        for(var my_cast in top_cast){
//collect the cast details and push it
          cast_ids.push(my_movie.cast[my_cast].id)
          cast_names.push(my_movie.cast[my_cast].name);
          cast_chars.push(my_movie.cast[my_cast].character);
          cast_profiles.push("https://image.tmdb.org/t/p/original"+my_movie.cast[my_cast].profile_path);
        }
      },
      error: function(){
        alert("Invalid Request!");
        $("#loader").delay(500).fadeOut();
      }
    });

    return {cast_ids:cast_ids,cast_names:cast_names,cast_chars:cast_chars,cast_profiles:cast_profiles};
  }

// getting posters for all the recommended movies
//to get the posters for the recommended movies
function get_movie_posters(arr,my_api_key){
  var arr_poster_list = []
  for(var m in arr) {
    $.ajax({
      type:'GET',
      url:'https://api.themoviedb.org/3/search/movie?api_key='+my_api_key+'&query='+arr[m],
      async: false,
      success: function(m_data){
        arr_poster_list.push('https://image.tmdb.org/t/p/original'+m_data.results[0].poster_path);
      },
      error: function(){
        alert("Invalid Request!");
        $("#loader").delay(500).fadeOut();
      },
    })
  }
  return arr_poster_list;
}

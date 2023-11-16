const joke = document.getElementById('joke');
const previousJokeButton = document.getElementById('previousJokeButton');
const getJokeButton = document.getElementById('getJokeButton');
const nextJokeButton = document.getElementById('nextJokeButton');

const fetchJoke = () => {
    fetch('https://icanhazdadjoke.com/', {
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            // Check if there are existing jokes in localStorage. If not, create a new array
            const existingJokes = JSON.parse(localStorage.getItem('dadJokes')) || [];

            // Add joke to the array
            existingJokes.push(data.joke);

            // Store the updated array back into localStorage
            localStorage.setItem('dadJokes', JSON.stringify(existingJokes));

            joke.innerHTML = data.joke;

        })
        .catch(error => console.error('Error:', error));
}

const getPreviousJoke = () => {
    const existingJokes = JSON.parse(localStorage.getItem('dadJokes'));
    if (joke.innerHTML === '') { // Haven't gotten a joke yet.
        
        joke.innerHTML = existingJokes[existingJokes.length -1]; //get the last joke added to the array.
    } else { // There's a joke! Let's see if it's in storage
        const indexOfJoke = existingJokes.indexOf(joke.innerHTML); 
        if (indexOfJoke === 1) {
            joke.innerHTML = existingJokes[indexOfJoke -1];
            previousJokeButton.disabled = true;
            nextJokeButton.disabled = false;
        } else {
            joke.innerHTML = existingJokes[indexOfJoke -1];
            previousJokeButton.disabled = false;
            nextJokeButton.disabled = false;
        }
        
    }

}

const getNextJoke = () => {
    const existingJokes = JSON.parse(localStorage.getItem('dadJokes'));
    if (joke.innerHTML === '') { // Haven't gotten a joke yet.
        nextJokeButton.disabled = true;
        //joke.innerHTML = existingJokes[existingJokes.length -1]; //get the last joke added to the array.
    } else { // There's a joke! Let's see if it's in storage
        const indexOfJoke = existingJokes.indexOf(joke.innerHTML); 
        if (indexOfJoke === existingJokes.length -2) { // we have reached the end of the array. No more jokes!
            joke.innerHTML = existingJokes[indexOfJoke +1]; // get last joke
            nextJokeButton.disabled = true; //disable the button
        } else {
            joke.innerHTML = existingJokes[indexOfJoke +1]; // more jokes to be had!
            nextJokeButton.disabled = false;

        }
        
    }

}

getJokeButton.addEventListener("click", fetchJoke);
previousJokeButton.addEventListener("click", getPreviousJoke);
nextJokeButton.addEventListener("click", getNextJoke);
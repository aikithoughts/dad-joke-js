class JokeManager {
    constructor() {
        this.jokes = JSON.parse(localStorage.getItem('dadJokes')) || [];
    }

    async fetchJoke() {
        try {
            const response = await fetch('https://icanhazdadjoke.com/', {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            this.jokes.push(data.joke);
            localStorage.setItem('dadJokes', JSON.stringify(this.jokes));
            return data.joke;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    getPreviousJoke(currentJoke) {
        const index = this.jokes.indexOf(currentJoke);
        return index > 0 ? this.jokes[index - 1] : null;
    }

    getNextJoke(currentJoke) {
        const index = this.jokes.indexOf(currentJoke);
        return index < this.jokes.length - 1 ? this.jokes[index + 1] : null;
    }
}

function enableDisableButtons(jokeManager, currentJoke) {
    const previousJokeButton = document.getElementById('previousJokeButton');
    const nextJokeButton = document.getElementById('nextJokeButton');

    previousJokeButton.disabled = jokeManager.getPreviousJoke(currentJoke) === null;
    nextJokeButton.disabled = jokeManager.getNextJoke(currentJoke) === null;
}

async function displayJoke(jokeManager, jokeDestination) {
    try {
        const jokeData = await jokeManager.fetchJoke();
        jokeDestination.innerHTML = jokeData;
        enableDisableButtons(jokeManager, jokeData);
    } catch (error) {
        console.error('Could not get joke', error);
    }
}

window.addEventListener('load', () => {
    const jokeContainer = document.getElementById('joke');
    const getJokeButton = document.getElementById('getJokeButton');
    const previousJokeButton = document.getElementById('previousJokeButton');
    const nextJokeButton = document.getElementById('nextJokeButton');

    let jokeManager = new JokeManager();

    if (jokeManager.jokes.length > 0) {
        previousJokeButton.disabled = false;
        jokeContainer.innerHTML = jokeManager.jokes[jokeManager.jokes.length - 1];
    }

    getJokeButton.addEventListener("click", () => displayJoke(jokeManager, jokeContainer));
    previousJokeButton.addEventListener("click", () => {
        const previousJoke = jokeManager.getPreviousJoke(jokeContainer.innerHTML);
        if (previousJoke !== null) {
            jokeContainer.innerHTML = previousJoke;
            enableDisableButtons(jokeManager, previousJoke);
        }
    });
    nextJokeButton.addEventListener("click", () => {
        const nextJoke = jokeManager.getNextJoke(jokeContainer.innerHTML);
        if (nextJoke !== null) {
            jokeContainer.innerHTML = nextJoke;
            enableDisableButtons(jokeManager, nextJoke);
        }
    });
});
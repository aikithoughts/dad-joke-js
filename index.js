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

    enableDisableButtons(currentJoke, previousButton, nextButton) {
        previousButton.disabled = this.getPreviousJoke(currentJoke) === null;
        nextButton.disabled = this.getNextJoke(currentJoke) === null;
    }

    async displayJoke(jokeDestination) {
        try {
            const jokeData = await this.fetchJoke();
            jokeDestination.innerHTML = jokeData;
            this.enableDisableButtons(jokeData, previousJokeButton, nextJokeButton);
        } catch (error) {
            console.error('Could not get joke', error);
        }
    }
}

window.addEventListener('load', () => {
    const jokeContainer = document.getElementById('joke');
    const getJokeButton = document.getElementById('getJokeButton');
    const previousJokeButton = document.getElementById('previousJokeButton');
    const nextJokeButton = document.getElementById('nextJokeButton');

    const jokeManager = new JokeManager();

    if (jokeManager.jokes.length > 0) {
        previousJokeButton.disabled = false;
        jokeContainer.innerHTML = jokeManager.jokes[jokeManager.jokes.length - 1];
    }

    getJokeButton.addEventListener("click", () => jokeManager.displayJoke(jokeContainer));
    previousJokeButton.addEventListener("click", () => {
        const previousJoke = jokeManager.getPreviousJoke(jokeContainer.innerHTML);
        if (previousJoke !== null) {
            jokeContainer.innerHTML = previousJoke;
            jokeManager.enableDisableButtons(previousJoke, previousJokeButton, nextJokeButton);
        }
    });
    nextJokeButton.addEventListener("click", () => {
        const nextJoke = jokeManager.getNextJoke(jokeContainer.innerHTML);
        if (nextJoke !== null) {
            jokeContainer.innerHTML = nextJoke;
            jokeManager.enableDisableButtons(nextJoke, previousJokeButton, nextJokeButton);
        }
    });
});

module.exports = JokeManager;

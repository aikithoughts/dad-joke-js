class JokeManager {
    constructor() {
        this.jokes = JSON.parse(localStorage.getItem('dadJokes')) || [];
    }

    async fetchJoke(retries = 3) {
        try {
            if (retries === 0) {
                throw new Error('Maximum retries reached.');
            }
    
            const response = await fetch('https://icanhazdadjoke.com/', {
                headers: {
                    'Accept': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            if (!this.findJoke(data.joke, this.jokes)) {
                this.jokes.push(data.joke);
                localStorage.setItem('dadJokes', JSON.stringify(this.jokes));
                return data.joke;
            } else {
                // Recursive call with reduced number of retries
                return this.fetchJoke(retries - 1);
            }
        } catch (error) {
            // Return a special value when the maximum retries are reached
            if (error.message === 'Maximum retries reached.') {
                return null;
            }
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

    findJoke(joke, jokes) {
        return jokes.includes(joke);
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

    if (jokeManager.jokes && jokeManager.jokes.length > 0) {
        previousJokeButton.disabled = false;
        jokeContainer.innerHTML = jokeManager.jokes[jokeManager.jokes.length - 1];
    } else {
        previousJokeButton.disabled = true;
        jokeContainer.innerHTML = 'Beware. These are not good jokes.';
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

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { JokeManager };
}

// For browsers (ES6 modules)
if (typeof window !== 'undefined') {
    window.JokeManager = JokeManager;
}

global.TextEncoder = require('text-encoding').TextEncoder;
global.TextDecoder = require('text-decoding').TextDecoder;

const { JokeManager } = require('./index');
const { JSDOM } = require('jsdom');
const { document } = new JSDOM(`<!DOCTYPE html>
    <html>
    <div class="mainContainer" id="main-container">
        <h1>Dave's Joke Machine</h1>
        <div class="jokeContainer" id="joke-container">
            <div class="joke" id="joke"></div>
            <button id="previousJokeButton">Previous Joke</button>
            <button id="getJokeButton">Get Joke</button>
            <button id="nextJokeButton" disabled>Next Joke</button>
        </div>
    </div>
    </html>
`).window;

global.document = window.document;

// Mock the internal storage
const localStorageMock = (function () {
    let store = {};

    return {
        getItem(key) {
            return store[key];
        },

        setItem(key, value) {
            store[key] = value;
        },

        clear() {
            store = {};
        },

        removeItem(key) {
            delete store[key];
        },

        getAll() {
            return store;
        },
    };
})();

// Replace global localStorage with the mock
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock the fetch function
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ joke: 'Mocked joke' }),
    })
);

global.document = window.document;

describe('JokeManager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('constructor initializes jokes from localStorage', () => {
        let dadJokes = ['Joke1', 'Joke2'];
        localStorage.setItem('dadJokes', JSON.stringify(dadJokes));
        const jokeManager = new JokeManager();
        expect(jokeManager.jokes).toEqual(dadJokes);
    });

    test('fetchJoke adds a new joke to the jokes array and localStorage', async () => {
        const jokeManager = new JokeManager();
        const existingJokes = ['Joke1', 'Joke2'];
        jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(existingJokes));
        const setItemSpy = jest.spyOn(localStorage, 'setItem');
        const newJoke = await jokeManager.fetchJoke();
        expect(global.fetch).toHaveBeenCalledWith('https://icanhazdadjoke.com/', {
            headers: {
                'Accept': 'application/json'
            }
        });

        expect(jokeManager.jokes).toContain(newJoke);
        expect(setItemSpy).toHaveBeenCalledWith('dadJokes', JSON.stringify([...existingJokes, newJoke]));
        expect(newJoke).toEqual('Mocked joke');
    });

    test('fetchJoke retries when joke already exists in localStorage', async () => {
        const jokeManager = new JokeManager();
        const existingJoke = 'Joke 1';
        jokeManager.jokes.push(existingJoke);
        localStorage.setItem('dadJokes', JSON.stringify(jokeManager.jokes));
    
        let fetchCallCount = 0;
    
        // Mock the fetch function to return the same joke every time
        global.fetch = jest.fn().mockImplementation(() => {
            fetchCallCount++;
            return Promise.resolve({
                ok: true,
                json: () => ({ joke: 'Joke 1' }),
            });
        });
    
        const joke = await jokeManager.fetchJoke();
    
        // Check that fetchJoke was called 3 times (initial call + 2 retries)
        expect(fetchCallCount).toBe(3);
    
        // Check that the returned value is null when maximum retries are reached
        expect(joke).toBeNull();
    });
    
    

    test('getPreviousJoke returns the previous joke in the array', () => {
        const jokeManager = new JokeManager();
        const existingJokes = ['Joke1', 'Joke2'];
        jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(existingJokes));
        expect(jokeManager.getPreviousJoke('Joke2')).toEqual('Joke1');
    });

    test('findJoke returns true', () => {
        const jokeManager = new JokeManager();
        const existingJokes = ['Joke1', 'Joke2'];
        expect(jokeManager.findJoke('Joke1', existingJokes)).toEqual(true);

    })

    test('getNextJoke returns the next joke in the array', () => {
        const jokeManager = new JokeManager();
        const existingJokes = ['Joke1', 'Joke2'];
        jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(existingJokes));
        expect(jokeManager.getNextJoke('Joke1')).toEqual('Joke2');
    });

    test('enableDisableButtons disables previousJokeButton and enables nextJokeButton if current joke is at the beginning of the joke array', () => {
        const jokeManager = new JokeManager();

        const existingJokes = ['Joke1', 'Joke2'];
        jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(existingJokes));

        const previousJokeButton = document.getElementById('previousJokeButton');
        const nextJokeButton = document.getElementById('nextJokeButton');

        jokeManager.enableDisableButtons(existingJokes[0], previousJokeButton, nextJokeButton);

        expect(previousJokeButton.disabled).toBe(true);
        expect(nextJokeButton.disabled).toBe(false);
    });

    test('enableDisableButtons disables nextJokeButton and enables previousJokeButton if current joke is at the end of the joke array', () => {
        const jokeManager = new JokeManager();

        const existingJokes = ['Joke1', 'Joke2'];
        jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(existingJokes));

        const previousJokeButton = document.getElementById('previousJokeButton');
        const nextJokeButton = document.getElementById('nextJokeButton');

        jokeManager.enableDisableButtons(existingJokes[1], previousJokeButton, nextJokeButton);

        expect(previousJokeButton.disabled).toBe(false);
        expect(nextJokeButton.disabled).toBe(true);
    });

    test('enableDisableButtons enables both nextJokeButton and previousJokeButton if current joke is in the middle of the joke array', () => {
        const existingJokes = ['Joke1', 'Joke2', 'Joke3'];
        localStorage.setItem('dadJokes', JSON.stringify(existingJokes));
        jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(existingJokes));

        const jokeManager = new JokeManager();
    
        const previousJokeButton = document.getElementById('previousJokeButton');
        const nextJokeButton = document.getElementById('nextJokeButton');
    
        jokeManager.enableDisableButtons(existingJokes[1], previousJokeButton, nextJokeButton);
    
        expect(previousJokeButton.disabled).toBe(false);
        expect(nextJokeButton.disabled).toBe(false);
    });

});



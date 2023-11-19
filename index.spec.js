global.TextEncoder = require('text-encoding').TextEncoder;
global.TextDecoder = require('text-decoding').TextDecoder;

const JokeManager = require('./index');
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
        // Clear mock calls before testing
        jest.clearAllMocks();
    });

    test('constructor initializes jokes from localStorage', () => {
        let dadJokes = ['Joke1', 'Joke2'];
        localStorage.setItem('dadJokes', JSON.stringify(dadJokes));
        const jokeManager = new JokeManager();
        expect(jokeManager.jokes).toEqual(dadJokes);
    });

    test('fetchJoke adds a new joke to the jokes array and localStorage', async () => {
        // Arrange: Create a new JokeManager instance
        const jokeManager = new JokeManager();

        // Arrange: Mock the existing jokes in localStorage
        const existingJokes = ['Joke1', 'Joke2'];
        jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(existingJokes));

        // Arrange: Spy on setItem to capture the arguments
        const setItemSpy = jest.spyOn(localStorage, 'setItem');

        // Act: Call fetchJoke
        const newJoke = await jokeManager.fetchJoke();

        // Assert: Verify that the fetch function was called
        expect(global.fetch).toHaveBeenCalledWith('https://icanhazdadjoke.com/', {
            headers: {
                'Accept': 'application/json'
            }
        });

        // Assert: Verify that the new joke is added to the jokes array without considering the order
        expect(jokeManager.jokes).toContain(newJoke);

        // Assert: Verify that localStorage.setItem was called with the correct arguments
        expect(setItemSpy).toHaveBeenCalledWith('dadJokes', JSON.stringify([...existingJokes, newJoke]));

        // Assert: Verify that the function returns the fetched joke
        expect(newJoke).toEqual('Mocked joke');
    });

    test('getPreviousJoke returns the previous joke in the array', () => {
        // Arrange: Create a new JokeManager instance
        const jokeManager = new JokeManager();
        // Arrange: Mock the existing jokes in localStorage
        const existingJokes = ['Joke1', 'Joke2'];
        jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(existingJokes));
        expect(jokeManager.getPreviousJoke('Joke2')).toEqual('Joke1');
    });

    test('getNextJoke returns the next joke in the array', () => {
        // Arrange: Create a new JokeManager instance
        const jokeManager = new JokeManager();
        // Arrange: Mock the existing jokes in localStorage
        const existingJokes = ['Joke1', 'Joke2'];
        jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(existingJokes));
        expect(jokeManager.getNextJoke('Joke1')).toEqual('Joke2');
    });

    test('enableDisableButtons disables previousJokeButton and enables nextJokeButton if current joke is at the beginning of the joke array', () => {
        // Arrange: Create a new JokeManager instance
        const jokeManager = new JokeManager();

        const existingJokes = ['Joke1', 'Joke2'];
        jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(existingJokes));


        // Arrange: Set up the HTML elements
        // const jokeContainer = document.getElementById('joke');
        const previousJokeButton = document.getElementById('previousJokeButton');
        const nextJokeButton = document.getElementById('nextJokeButton');

        // Act: Call enableDisableButtons
        jokeManager.enableDisableButtons(existingJokes[0], previousJokeButton, nextJokeButton);

        // Assert: Verify that the buttons are disabled
        expect(previousJokeButton.disabled).toBe(true);
        expect(nextJokeButton.disabled).toBe(false);
    });

    test('enableDisableButtons disables nextJokeButton and enables previousJokeButton if current joke is at the end of the joke array', () => {
        // Arrange: Create a new JokeManager instance
        const jokeManager = new JokeManager();

        const existingJokes = ['Joke1', 'Joke2'];
        jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(existingJokes));


        // Arrange: Set up the HTML elements
        // const jokeContainer = document.getElementById('joke');
        const previousJokeButton = document.getElementById('previousJokeButton');
        const nextJokeButton = document.getElementById('nextJokeButton');

        // Act: Call enableDisableButtons
        jokeManager.enableDisableButtons(existingJokes[1], previousJokeButton, nextJokeButton);

        // Assert: Verify that the buttons are disabled
        expect(previousJokeButton.disabled).toBe(false);
        expect(nextJokeButton.disabled).toBe(true);
    });

    test('enableDisableButtons enables both nextJokeButton and previousJokeButton if current joke is in the middle of the joke array', () => {
        const existingJokes = ['Joke1', 'Joke2', 'Joke3'];
        localStorage.setItem('dadJokes', JSON.stringify(existingJokes));
    
        // Arrange: Spy on localStorage.getItem before creating the JokeManager instance
        jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(existingJokes));
    
        // Create a new JokeManager instance
        const jokeManager = new JokeManager();
    
        // Arrange: Set up the HTML elements
        const previousJokeButton = document.getElementById('previousJokeButton');
        const nextJokeButton = document.getElementById('nextJokeButton');
    
        // Act: Call enableDisableButtons with the current joke in the middle of the array
        jokeManager.enableDisableButtons(existingJokes[1], previousJokeButton, nextJokeButton);
    
        // Assert: Verify that the buttons are enabled
        expect(previousJokeButton.disabled).toBe(false);
        expect(nextJokeButton.disabled).toBe(false);
    });

});



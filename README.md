# Dave's Joke Machine

This project represents my final assignment for the UW's JSCRIPT 310B for Fall Quarter, 2023. The application is a Dad Joke generator.

## Getting a joke

To get a joke:

1. Download the repository to your local machine.
2. Open the file, index.html, in a browser. (The Chrome browser is recommended.)
3. Click **Get Joke**.

## View previous jokes

The joke machine stores previously loaded jokes in local storage.

To view previous jokes, click **Previous Joke**.

## View next joke

If you are viewing previous jokes, you return to a newer joke by clicking **Next Joke**.

## Testing the code

The application uses Jest, not Jasmine, for testing purposes. (I got permission to do this from the instructor.)

To test the application:

1. Open a terminal and navigate to the repository.
2. Run the command, `npx jest`.

## Assignment details

This application complies with the following assignment requirements:

1. **Class usage**. The application has a class, JokeManager, which contains the appropriate functions for managing the jokes.
2. **Testable code**. The application has a set of tests. **Note** The application uses `Jest`, not Jasmine, for testing. To test the application, open a terminal and navigate to the repository. Then run the command, `npx jest`. (I did get permission to use this framework instead of Jasmine from the instructor.)
3. **Fetch request**. The application fetches the joke from a third party API, https://icanhazdadjoke.com/api. This API does NOT require an API key, so you should be able to run it without issues.
4. **Local storage**. The application sets and upates local storage.

## Important

While this application is functional and complies with the requirements, I cannot vouch for the humorousness of the jokes. Be warned that some of them are absolutely, positively, terrible.

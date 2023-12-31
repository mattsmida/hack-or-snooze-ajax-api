"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    const storyURL = new URL(this.url);
    const storyURLHostName = storyURL.hostname;
    return storyURLHostName;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await fetch(`${BASE_URL}/stories`, {
      method: "GET",
    });
    const storiesData = await response.json();

    // turn plain old story objects from API into instances of Story class
    const stories = storiesData.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(currentUser, newStoryData) {
    // TODO: good practice to destructure before POST, specifically destructure newStoryData
    const postRequestBody = {
      "token": currentUser.loginToken,
      "story": newStoryData
    };
    const response = await fetch(`${BASE_URL}/stories`,
      {
        method: "POST",
        body: JSON.stringify(postRequestBody)
      }
    );

    const newStoryInstance = await response.json();
    return new Story(newStoryInstance.story);
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      body: JSON.stringify({ user: { username, password, name } }),
      headers: {
        "content-type": "application/json",
      }
    });
    const userData = await response.json();
    const { user } = userData;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      userData.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      body: JSON.stringify({ user: { username, password } }),
      headers: {
        "content-type": "application/json",
      }
    });
    const userData = await response.json();
    const { user } = userData;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      userData.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const tokenParams = new URLSearchParams({ token });

      const response = await fetch(
        `${BASE_URL}/users/${username}?${tokenParams}`,
        {
          method: "GET"
        }
      );
      const userData = await response.json();
      const { user } = userData;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  /** addFavoriteStory is a method function on the User class
   * Input: A previously unfavorited instance of a Story class "story"
   * Actions: This posts the new favorite "story" to the API and updates the
   * current user's favorite story list.
   * Outputs: None
  */
  //TODO: Improve naming for responseObj and increasedFavorites
  async addFavoriteStory(story) {
    const postRequestBody = {
      "token": currentUser.loginToken,
    };
    const response = await fetch(`${BASE_URL}/users/` +
        `${currentUser.username}/favorites/${story.storyId}`,
        {
          method: "POST",
          body: JSON.stringify(postRequestBody)
        }
    );

    const responseObj = await response.json();
    const increasedFavorites = responseObj.user.favorites

    currentUser.favorites = increasedFavorites;
  }

  // TODO: Could make a helper function to call either unFavoriteStory or
  // favoriteStory with the appropriate API method POST or DELETE.

  /** unFavoriteStory is a method function on the User class
   * Input: A previously favorited instance of a Story class "story"
   * Actions: This deletes the targeted favorite "story" from the API and
   * updates the current user's favorite story list.
   * Outputs: None
   */
  //TODO: Improve naming for responseObj and increasedFavorites
  async unFavoriteStory(story) {
    const postRequestBody = {
      "token": currentUser.loginToken,
    };
    const response = await fetch(`${BASE_URL}/users/` +
        `${currentUser.username}/favorites/${story.storyId}`,
        {
          method: "DELETE",
          body: JSON.stringify(postRequestBody)
        }
    );

    const responseObj = await response.json();
    const reducedFavorites = await responseObj.user.favorites

    currentUser.favorites = reducedFavorites;
  }
}

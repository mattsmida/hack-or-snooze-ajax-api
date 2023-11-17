"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Prepends story links with filled or unfilled stars for logged-in users
 *  depending on whether the stories are favorite or not favorite.
 *  No input or output.
*/

function addFavoriteStars() {
  $allStoriesList.children().prepend('<i class="bi bi-star"></i>');
  // TODO: implement the star-fill version for favorites.
  $allStoriesList.children().prepend('<i class="bi bi-star-fill"></i>');
}

/** This function gets the details of a single new story submitted by the
 *  user in the story-submission form, processes the story by sending a POST
 *  request, and then adds the story to the DOM at the top of the story list.
 */
// TODO: DS should say that you clear the input fields.
// TODO: indicate that a request is happening in the name!

async function putUserSubmittedStoryOnPage() {
  const author = $('#story-author-name').val();
  const title = $('#story-title').val();
  const url = $('#story-url-name').val();
  const newStoryData = { author, title, url };

  const newStoryInstance = await storyList.addStory(currentUser, newStoryData);
  const $newStoryPost = generateStoryMarkup(newStoryInstance);

  storyList.stories.unshift(newStoryInstance);
  $allStoriesList.prepend($newStoryPost);
  // Clears story submission form values.
  $('#story-author-name').val("");
  $('#story-title').val("");
  $('#story-url-name').val("");
}

/** Event listerned on story submit form for a submission. Prevents a refresh,
 * hides the form, and invokes the putUserSubmittedStoryOnPage function.
 */

$storySubmitForm.on('submit', async function handleSubmitClick(evt) {
  evt.preventDefault();
  $storySubmitForm.hide();
  await putUserSubmittedStoryOnPage();
});
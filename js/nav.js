"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  evt.preventDefault();
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  evt.preventDefault();
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */
//TODO: See if form hides on 37 and 38 can be moved to a better spot.
function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $loginForm.hide();
  $signupForm.hide();
  $navUserOptions.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

// TODO: Could reorganize this to match the site layout.

/** Show story submission form on click on "login" */

function navStorySubmitClick(evt) {
  console.debug("navStorySubmitClick", evt);
  evt.preventDefault();
  $storySubmitForm.show();
}

$navStorySubmit.on("click", navStorySubmitClick);
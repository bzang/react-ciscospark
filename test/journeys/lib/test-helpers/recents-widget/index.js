import {assert} from 'chai';

import {sendMessage} from '../../sdk';
import waitForPromise from '../../wait-for-promise';

/**
 * Sends a message to a space and verifies that it is received and displayed
 *
 * @export
 * @param {object} aBrowser
 * @param {object} sender - Person with spark object
 * @param {object} conversation
 * @param {string} message
 * @param {boolean} [isOneOnOne=false]
 * @returns {undefined}
 */
export function displayIncomingMessage({
  page, sender, space, message, isOneOnOne = false
}) {
  const spaceTitle = isOneOnOne ? sender.displayName : space.displayName;
  sendMessage({sparkInstance: sender.spark, space, message});

  browser.waitUntil(() =>
    page.firstSpaceTitleText === spaceTitle,
  5000, 'failed to display space');
  browser.waitUntil(() =>
    page.firstSpaceLastActivityText.includes(message),
  5000, 'failed to display last message');
  assert.isTrue(page.hasfirstUnreadIndicator, 'does not have unread indicator');
}

/**
 * Sends a message to a space and verifies that it is received and displayed,
 * then marks it read.
 *
 * @export
 * @param {object} aBrowser
 * @param {object} sender - Person with spark object
 * @param {object} receiver - Person with spark object
 * @param {object} conversation
 * @param {string} message
 * @returns {undefined}
 */
export function displayAndReadIncomingMessage({
  page, sender, receiver, space, message
}) {
  const activity = page.postToSpace({sender, space, message});

  browser.waitUntil(() =>
    page.firstSpaceLastActivityText.includes(message),
  5000, 'does not have last message sent');
  assert.isTrue(page.hasfirstUnreadIndicator, 'does not have unread indicator');

  // Acknowledge the activity to mark it read
  browser.call(() => receiver.spark.internal.conversation.acknowledge(space, activity));
  browser.waitUntil(() =>
    !page.hasfirstUnreadIndicator,
  5000, 'does not remove unread indicator');
}

/**
 * Creates a new space and posts a message to it, then verifies
 * space is displayed properly
 *
 * @export
 * @param {object} aBrowser
 * @param {object} sender
 * @param {array} participants
 * @param {string} roomTitle
 * @param {string} firstPost
 * @param {boolean} [isOneOnOne=false]
 * @returns {undefined}
 */
export function createSpaceAndPost(aBrowser, sender, participants, roomTitle, firstPost, isOneOnOne = false) {
  const spaceTitle = isOneOnOne ? sender.displayName : roomTitle;
  let conversation;
  const createOptions = {
    participants
  };
  if (roomTitle) {
    createOptions.displayName = roomTitle;
  }
  waitForPromise(sender.spark.internal.conversation.create(createOptions)
    .then((c) => {
      conversation = c;
      return sender.spark.internal.conversation.post(c, {
        displayName: firstPost
      });
    }));
  browser.waitUntil(() =>
    aBrowser.getText(`${elements.firstSpace} ${elements.title}`).includes(spaceTitle),
  5000,
  'does not display newly created space title');
  browser.waitUntil(() =>
    aBrowser.getText(`${elements.firstSpace} ${elements.lastActivity}`).includes(firstPost),
  5000,
  'does not have last message sent');
  return conversation;
}

import {createSpace} from '../sdk';

import BaseWidgetObject from './base';


export default class RecentsWidget extends BaseWidgetObject {
  get hasRecentsWidget() { return this.browser.isVisible(this.elements.recentsWidget); }

  get hasCallButton() { return this.browser.isVisible(this.elements.callButton); }

  get hasfirstUnreadIndicator() {
    return this.browser.isVisible(`${this.elements.firstSpace} ${this.elements.unreadIndicator}`);
  }

  get firstSpaceTitleText() { return this.browser.getText(`${this.elements.firstSpace} ${this.elements.title}`); }

  get firstSpaceLastActivityText() {
    return this.browser.getText(`${this.elements.firstSpace} ${this.elements.lastActivity}`);
  }

  constructor(props) {
    super(props);
    this.elements = Object.assign({}, this.elements, {
      recentsWidget: '.ciscospark-spaces-list-wrapper',
      firstSpace: '.space-item:first-child',
      title: '.space-title',
      unreadIndicator: '.space-unread-indicator',
      lastActivity: '.space-last-activity',
      callButton: 'button[aria-label="Call Space"]',
      answerButton: 'button[aria-label="Answer"]'
    });
  }

  loadWidget() {
    this.browser.execute((accessToken) => {
      window.openRecentsWidget({
        accessToken
      });
    }, this.user.token.access_token);
  }

  createSpace(options) {
    return createSpace({
      sparkInstance: this.user.spark,
      ...options
    });
  }

  postToSpace({
    sender = this.user, space, message
  }) {
    let activity;
    browser.call(() => sender.spark.internal.conversation.post(space, {
      displayName: message,
      content: message
    }).then((a) => {
      activity = a;
    }));
    return activity;
  }

  moveMouseToFirstSpace() {
    this.moveMouse(this.elements.firstSpace);
  }
}

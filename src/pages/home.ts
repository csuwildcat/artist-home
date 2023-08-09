import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import '../components/global.js'

@customElement('page-home')
export class PageHome extends LitElement {

  constructor() {
    super();
  }

  static get styles() {
    return [
      css`

      :host {
        padding: 0 !important;
      }

      :host > * {
        max-width: var(--content-max-width);
        margin: 0 auto;
      }

      :host > header {
        max-width: none;
        padding: 0.75em 0.6em;
        background: rgba(200, 200, 200, 0.05);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        border-bottom: 1px solid rgba(255 255 255 / 0.04)
      }

      #search_input {
        max-width: 400px;
        min-width: 200px;
        margin: auto;
      }

      #artist_content {
        margin-top: 2em;
        padding: 0 2em;
      }

      #artist_content:not([editable]) .edit-artist-trigger {
        display: none;
      }

      #artist_content_header {
        display: flex;
        align-items: center;
        margin: 0 0 2em 0;
      }

      #artist_avatar {
        height: 4.5em;
        padding: 0.1em;
        margin: 0 1.25em 0 0;
        background: #fff;
        border-radius: 100%;
      }

      #artist_content_header h2 {
        font-size: 2em;
        font-weight: bold;
      }

      #artist_content_header h2:empty:before {
        content: "YOUR NAME HERE"
      }

      #artist_content_header sl-button {
        margin-left: auto;
      }

      #artist_photo {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 3em;
      }

      #artist_photo div {
        position: relative;
        display: block;
        flex: 1;
        width: 40%;
      }

      #artist_photo img {
        width: 100%;
        background: #fff;
      }

      #artist_photo_middle {
        position: relative;
        margin: 0 -20%;
        z-index: 1;
        transform: scale(1.05);
      }

      #artist_photo_left::before, #artist_photo_right::before {
        content: "";
        position: absolute;
        display: block;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }

      #artist_photo_left::before {
        background: linear-gradient(to right, rgba(0, 0, 0, 0.9), transparent);
      }

      #artist_photo_right::before {
        background: linear-gradient(to left, rgba(0, 0, 0, 0.9), transparent);
      }

      #artist_bio:empty::before {
        content: "ADD YOUR BIO"
      }



      #edit_social_modal sl-input {
        margin: 0 0 1em;
      }

    `];
  }

  params(){
    return new URLSearchParams(window.location.search);
  }

  async firstUpdated() {
    console.log('This is your home page');
  }

  async onPageEnter(){
    this.loadArtist(this.params().get('did'));
  }

  async onPageLeave(){
    console.log('Home page is hiding');
  }

  async loadArtist(did){
    const social = await datastore.getSocialProfile() || {};
    console.log(social);
    did = did || globalThis.userDID;
    if (this.currentArtist === did) return;
    this.currentArtist = did;
    if (this.currentArtist === globalThis.userDID) {
      this.renderRoot.querySelector('#artist_content').setAttribute('editable', '')
    }
    else {
      this.renderRoot.querySelector('#artist_content').removeAttribute('editable')
    }

    const photo = await datastore.getImage('photo');
    console.log(photo);
    console.log('Home page is showing');
  }

  async openEditSocialModal(){
    const social = await datastore.getSocialProfile(globalThis.userDID) || {};
    console.log(social);

    this.renderRoot.querySelector('#edit_social_name').value = social.displayName || '';
    this.renderRoot.querySelector('#edit_social_bio').value = social.bio || '';
    this.renderRoot.querySelector('#edit_social_twitter').value = social?.apps?.twitter || '';
    this.renderRoot.querySelector('#edit_social_instagram').value = social?.apps?.instagram || '';

    this.renderRoot.querySelector('#edit_social_modal').show()
  }

  closeEditSocialModal(){
    this.renderRoot.querySelector('#edit_social_modal').hide()
  }

  async saveSocialInfo(){
    await datastore.setSocialProfile({
      displayName: this.renderRoot.querySelector('#edit_social_name').value,
      bio: this.renderRoot.querySelector('#edit_social_bio').value,
      apps: {
        twitter: this.renderRoot.querySelector('#edit_social_twitter').value,
        instagram: this.renderRoot.querySelector('#edit_social_instagram').value
      }
    });
  }

  render() {
    return html`
      <header>
        <sl-input id="search_input" slot="navbar" size="small" placeholder="Search for artist by DID" @keyup="${ e => {
          if (e.key === 'enter') this.loadArtist(e.currentTarget.value)
        }}"></sl-input>
      </header>
      <section id="artist_content">
        <header id="artist_content_header">
          <img id="artist_avatar" src="/assets/images/default-avatar.png" />
          <h2></h2>
          <sl-button class="edit-artist-trigger" variant="default" size="medium" @click="${e => this.openEditSocialModal()}">
            <sl-icon slot="prefix" name="pen"></sl-icon>
            Edit
          </sl-button>
        </header>
        <div id="artist_photo">
          <div id="artist_photo_left">
            <img src="/assets/images/default-artist-photo.png" />
          </div>
          <div id="artist_photo_middle">
            <img src="/assets/images/default-artist-photo.png" />
          </div>
          <div id="artist_photo_right">
            <img src="/assets/images/default-artist-photo.png" />
          </div>
        </div>
        <h3>Biography</h3>
        <p id="artist_bio"></p>
      </section>

      <sl-dialog id="edit_social_modal" label="Edit Profile Info" class="dialog-overview">
        <sl-input id="edit_social_name" placeholder="Enter a display name"></sl-input>
        <sl-textarea id="edit_social_bio" label="Bio"></sl-textarea>
        <h4>Social Accounts</h4>
        <sl-input id="edit_social_twitter" placeholder="Twitter" size="medium">
          <sl-icon name="twitter" slot="prefix"></sl-icon>
        </sl-input>
        <sl-input id="edit_social_instagram" placeholder="Instagram" size="medium">
          <sl-icon name="instagram" slot="prefix"></sl-icon>
        </sl-input>
        <sl-button slot="footer" variant="danger" @click="${e => this.closeEditSocialModal()}">Close</sl-button>
        <sl-button slot="footer" variant="success" @click="${e => this.saveSocialInfo()}">Create</sl-button>
      </sl-dialog>
    `;
  }
}

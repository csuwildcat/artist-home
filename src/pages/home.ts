import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import '../components/global.js'
// import '@vaadin/upload';

@customElement('page-home')
export class PageHome extends LitElement {

  @property({ type: Object }) socialProfile = {
    displayName: '',
    bio: '',
    apps: {
      twitter: '',
      instagram: ''
    }
  };

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
        margin: 2em auto;
        padding: 0 2em 2em;
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
        margin-left: 1.5em;
      }

      #artist_content_header sl-button:last-child {
        margin-left: auto;
      }

      #artist_photo {
        display: flex;
        position: relative;
        left: 50%;
        min-width: 600px;
        justify-content: center;
        align-items: center;
        margin-bottom: 3em;
        transform: translateX(-50%);
      }

      #artist_photo div {
        position: relative;
        display: block;
        flex: 1;
        width: 40%;
        max-width: 80vw;
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

      #artist_content h3 {
        margin-top: 2em;
      }

      #artist_bio:empty::before {
        content: "ADD YOUR BIO"
      }

      #artist_accounts {
        display: flex;
        flex-direction: row;
        width: 33.33%;
        padding: 0;
        font-size: 0.8em;
        list-style: none;
      }

      #artist_accounts li a {
        display: flex;
        align-items: center;
        padding: 0.6em 0.8em;
        margin: 0.6em 1.2em 0.6em 0;
        border: 1px solid #fff;
        border-radius: 8px;
        text-decoration: none;
        color: #fff;
      }

      #artist_accounts li a[href]:hover {
        background: rgba(255 255 255 / 0.06);
      }

      #artist_accounts sl-icon {
        margin: 0 0.4em 0 0;
        font-size: 1.9em;
      }

      #artist_accounts strong {
        display: block;
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
    console.log(did);
    did = did || globalThis.userDID;
    if (this.currentArtist === did) return;
    this.currentArtist = did;
    if (this.currentArtist === globalThis.userDID) {
      this.renderRoot.querySelector('#artist_content').setAttribute('editable', '')
    }
    else {
      this.renderRoot.querySelector('#artist_content').removeAttribute('editable')
    }

    const social = await datastore.getSocialInfo(did);
    this.socialProfile = await social?.data?.json?.() || this.socialProfile;

    // const photo = await datastore.getImage('photo');
    // console.log(photo);
    console.log('Home page is showing');
  }



  async openEditSocialModal(){
    const social = await datastore.getSocialInfo(globalThis.userDID);
    this.socialProfile = await social?.data?.json?.() || this.socialProfile;
    console.log(this.socialProfile);

    // this.renderRoot.querySelector('#edit_social_name').value = social.displayName || '';
    // this.renderRoot.querySelector('#edit_social_bio').value = social.bio || '';
    // this.renderRoot.querySelector('#edit_social_twitter').value = social?.apps?.twitter || '';
    // this.renderRoot.querySelector('#edit_social_instagram').value = social?.apps?.instagram || '';

    this.renderRoot.querySelector('#edit_social_modal').show()
  }

  closeEditSocialModal(){
    this.renderRoot.querySelector('#edit_social_modal').hide()
  }

  async saveSocialInfo(){
    await datastore.ready;
    const uploader = this.renderRoot.querySelector('#photo_file_drop vaadin-upload')
    let data = {
      displayName: this.renderRoot.querySelector('#edit_social_name').value,
      bio: this.renderRoot.querySelector('#edit_social_bio').value,
      apps: {
        twitter: this.renderRoot.querySelector('#edit_social_twitter').value,
        instagram: this.renderRoot.querySelector('#edit_social_instagram').value
      }
    }
    await datastore.setSocialInfo(data);
    const file = uploader?.files?.[0];
    if (file){
      console.log(file.type);
      //await datastore.setImage('photo', file);
    }
    this.socialProfile = data;
  }

  clearUploader(){
    const uploader = this.renderRoot.querySelector('#edit_photo_modal vaadin-upload');
    uploader.files = [];
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
          <h2>${this.socialProfile.displayName}</h2>
          <sl-button variant="primary" size="medium" @click="${e => this?.followArtist?.()}">Follow</sl-button>
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
        <p id="artist_bio">${this.socialProfile?.bio}</p>
        <h3>Social Accounts</h3>
        <ul id="artist_accounts">
          <li>
            <a href="http://twitter.com/${ifDefined(this.socialProfile?.apps?.twitter || undefined)}">
              <sl-icon name="twitter" slot="prefix"></sl-icon>
              <div>
                <strong>${this.socialProfile?.apps?.twitter}</strong>
                Twitter
              </div>
            </a>
          </li>
          <li>
            <a href="http://instagram.com/${ifDefined(this.socialProfile?.apps?.instagram || undefined)}">
              <sl-icon name="instagram" slot="prefix"></sl-icon>
              <div>
                <strong>${this.socialProfile?.apps?.instagram}</strong>
                Instagram
              </div>
            </a>
          </li>
        </ul>
      </section>

      <sl-dialog id="edit_social_modal" label="Edit Profile Info" class="dialog-overview">
        <sl-input id="edit_social_name" placeholder="Enter a display name" value="${this.socialProfile?.displayName}"></sl-input>
        <sl-textarea id="edit_social_bio" label="Bio" value="${this.socialProfile?.bio}"></sl-textarea>
        <h4>Social Accounts</h4>
        <sl-input id="edit_social_twitter" placeholder="Twitter" size="medium" value="${this.socialProfile?.apps?.twitter}">
          <sl-icon name="twitter" slot="prefix"></sl-icon>
        </sl-input>
        <sl-input id="edit_social_instagram" placeholder="Instagram" size="medium" value="${this.socialProfile?.apps?.instagram}">
          <sl-icon name="instagram" slot="prefix"></sl-icon>
        </sl-input>
        <vaadin-upload
          no-auto
          maxFiles="1"
          id="photo_file_drop"
          accept="image/png, image/jpeg, image/gif, .gif, .jpeg, .png"
          .nodrop="${false}"
          @change="${{handleEvent: e => console.log(e), capture: true}}"
        >
          <vaadin-button slot="add-button" theme="primary">
            Upload an Image
          </vaadin-button>
          <span slot="drop-label">
            Drop an image file
          </span>
        </vaadin-upload>
        <sl-button slot="footer" variant="danger" @click="${e => this.closeEditSocialModal()}">Close</sl-button>
        <sl-button slot="footer" variant="success" @click="${e => {
          this.saveSocialInfo()
          this.closeEditSocialModal()
          }}">Save</sl-button>
      </sl-dialog>
    `;
  }
}

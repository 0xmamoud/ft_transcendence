import { BaseComponent } from "../../core/baseComponent";

class ProfilePage extends BaseComponent {
  constructor() {
    super();
  }

  render() {
    this.innerHTML = `
      <div class="profile-page">
        <h1>Profile Page</h1>
        <p>Welcome to the profile page!</p>
      </div>
    `;
  }
}

export default ProfilePage;

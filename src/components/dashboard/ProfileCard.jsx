import React from "react";
import "./ProfileCard.css";

export default function ProfileCard() {
  return (
    <div className="profile-card">
      <img
        src="/images/react.svg"
        alt="User"
        className="profile-avatar"
      />
      <div>
        <h2 className="profile-name">User Name</h2>
        <p className="profile-email">user@example.com</p>
      </div>
    </div>
  );
}




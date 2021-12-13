import React from "react";

interface IUserWaitingCardProps {
  name: string;
  onAccept: (...args) => void;
  onReject: (...args) => void;
}

function UserWaitingCard({}: IUserWaitingCardProps) {
  return <div></div>;
}

export default UserWaitingCard;

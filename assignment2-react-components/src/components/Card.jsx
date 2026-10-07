import { useState } from "react";
import Button from "./Button.jsx";

// Props: title, description, tag. State: liked and like count
function Card({ title, description, tag }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  const toggleLike = () => {
    setLikes(liked ? likes - 1 : likes + 1);
    setLiked(!liked);
  };

  return (
    <article className="card">
      <span className="tag">{tag}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="card-actions">
        <Button label={liked ? "Liked" : "Like"} variant={liked ? "primary" : "outline"} onClick={toggleLike} />
        <span>{likes} {likes === 1 ? "like" : "likes"}</span>
      </div>
    </article>
  );
}
export default Card;

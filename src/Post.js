import React, { useState, useEffect }from 'react';
import './post.css';
import Avatar from '@material-ui/core/Avatar';
import { db } from './firebase.js';
import firebase from 'firebase';


function Post({ postId, username, caption, imageUrl, signedInUser}) {
    const [comments, setComments] = useState([]);
    const [commentPost, setCommentPost] = useState("");

    // Update in real time new comments added to posts
    useEffect(() => {
        let unsubscribe;
        if (postId) {
            unsubscribe = db.collection("posts")
                .doc(postId)
                .collection("comments")
                .orderBy('timestamp', 'desc')
                .onSnapshot((snapshop) => {
                    setComments(snapshop.docs.map(doc => ({
                        id: doc.id,
                        data: doc.data()
                    })));
                });
        }

        return () => {
            unsubscribe();
        };
    }, [postId]);

    // Submit a comment
    const postComment = (event) => {
        event.preventDefault();

        const unsubscribeComment = db.collection("posts").doc(postId).collection("comments").add({
            comment: commentPost,
            username: signedInUser,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        setCommentPost('');

        return () => {
            unsubscribeComment();
        }
    };

    return (
        <div className="post">
            <div className="post__header">
                {/** header -> avatart + username */}
                <Avatar
                    className="post__avatar"
                    alt={ username }
                    src="static/images/avatar/1.jpg"/>
                <h3>{ username }</h3>
            </div>
            {/** image */}
            <img
                className="post__image"
                src={ imageUrl }
                alt="post_image"/>
            {/** username caption */}
            <div className="post__text">
                <strong>{ username }</strong> { caption }
            </div>
            {/** List of comments  */}
            <div className="post__comments">
                {
                    comments.map(({id, data}) => (
                        <p key={id}>
                            <strong>{data.username}</strong> {data.comment}
                        </p>
                    ))
                }
            </div>
            {/** Post comment */}
            { signedInUser && (
                <form className="post__commentBox">
                    <input
                        className="post__input"
                        placeholder="send a comment"
                        value={commentPost}
                        onChange={(e) => setCommentPost(e.target.value)}>
                    </input>
                    <button
                        className="post__button"
                        disabled={!commentPost}
                        type="submit"
                        onClick={postComment}>
                        Post
                    </button>
                </form>
            )}
            
        </div>
    )
}

export default Post;

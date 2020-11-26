import { Button } from '@material-ui/core';
import React, { useState } from 'react';
import { db, storage } from './firebase.js';
import firebase from 'firebase';
import './imageUpload.css';

function ImageUpload({ username }) {
    // States 
    const [image, setImage] = useState(null);
    const [progress, setProgress] = useState(0);
    const [caption, setCaption] = useState('');

    // event functions
    const handleChange = (e) => { // choosing an image
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleUpload = () => {  // uploading the image and caption
        // put image to firebase storage
        const uploadTask = storage.ref(`images/${image.name}`).put(image);
        // update progress asynchronously
        uploadTask.on(
            "state_changed",
            (snapshot) => { // upload progress function
                const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                setProgress(progress);
            },
            (error) => {
                // error function
                console.log(error);
                alert(error.message);
            },
            () => {
                // complete function, getting the link for the image
                storage.ref("images")
                    .child(image.name)
                    .getDownloadURL()
                    .then(url => {
                        // post imageUrl, caption, username on firebase database
                        db.collection("posts").add({
                            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                            caption: caption,
                            imageUrl: url,
                            username: username
                        }); 

                        setProgress(0);
                        setCaption("");
                        setImage(null);
                    })
            }
        );
    };

    return (
        <div className="imageUpload">
            {/** Image upload */}
            {/** Caption input */}
            {/** File Picker */}
            {/** post button */}
            <progress 
                className="imageUpload__progress"
                value={progress} 
                max="100"/>
            <input 
                type="text" 
                placeholder="Enter caption"
                value={caption}
                onChange={event => setCaption(event.target.value)}/>
            <input
                type="file"
                onChange={handleChange}/>
            <Button
                onClick={handleUpload}>
                upload
            </Button>
        </div>
    )
}

export default ImageUpload;

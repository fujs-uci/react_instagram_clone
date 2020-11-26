import React, { useState, useEffect } from 'react';
import './app.css';
import Post from './Post.js';
import ImageUpload from './ImageUpload.js';
import { db, auth } from './firebase.js';
import { Button, Input, Modal, Avatar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';


function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function App() {
  // useState maintains variables for the page
  const [posts, setPosts] = useState([]);
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [openSignIn, setOpenSignIn] = useState(false);

  // useEffect runs code based on condition
  // userEffect is a frontEnd listener
  useEffect(() => {
    // onAuthStateChanged is a backend listener
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // user has logged in
        console.log(authUser);
        setUser(authUser);
      } else {
        // user has logged out
        setUser(null);
      }
    });

  // cleanup functions
  return () => {
    unsubscribe();
  }
  // this useEffect is deendant on changes on user and username
  }, [user, username]); 

  useEffect(() => {
    db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
      setPosts(snapshot.docs.map(doc => ({
        id: doc.id,
        post: doc.data()
      })))
    });
    // this userEffect has no dependencies so it runs once
  }, []);

  // signIn
  const signIn = (event) => {
    event.preventDefault();

    auth.signInWithEmailAndPassword(email, password)
      .catch((error) => alert(error.message));

    setOpenSignIn(false);
  }

  // signUp and create user with firebase.auth()
  const signUp = (event) => {
    event.preventDefault();

    auth.createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          displayName: username
        })
      })
      .catch((error) => alert(error.message));
    
    setOpen(false);
  }


  return (
    <div className="app">
      {/** Login */}
      <Modal
        open={openSignIn}
        onClose={() => setOpenSignIn(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signup">
            <center>
              <img
                className="app__headerImage"
                src="https://www.instagram.com/static/images/web/mobile_nav_type_logo-2x.png/1b47f9d0e595.png"
                alt="Instagram"/>
            </center>
            <Input
              placeholder="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}/>
            <Input
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}/>
            <Button onClick={signIn}>Login</Button>
          </form>
        </div>
      </Modal>

      {/** SignIn */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signup">
            <center>
              <img
                className="app__headerImage"
                src="https://www.instagram.com/static/images/web/mobile_nav_type_logo-2x.png/1b47f9d0e595.png"
                alt="Instagram"/>
            </center>
            <Input
              placeholder="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}/>
            <Input
              placeholder="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}/>
            <Input
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}/>
            <Button onClick={signUp}>Sign Up</Button>
          </form>
        </div>
      </Modal>

      {/* Header */}
      <div className="app__header">
        <img
          className="app__headerImage"
          src="https://www.instagram.com/static/images/web/mobile_nav_type_logo-2x.png/1b47f9d0e595.png"
          alt="instagram logo"/>
        { user ? (
          <div className="app__loginContainer">
            <Avatar
                    className="app__avatar"
                    alt={ user.displayName }
                    src="static/images/avatar/1.jpg"/>
            <Button
              onClick={() => auth.signOut()}
              >Logout
            </Button>
          </div>
        ) : (
          <div className="app__loginContainer">
            <Button
              onClick={() => setOpenSignIn(true)}
              >Login
            </Button>
            <Button
              onClick={() => setOpen(true)}
              >Sign Up
            </Button>
          </div>
        )}
      </div>

      <div className="app__content">
        {/* Posts */}
        <div className="app__posts">
          {
            posts.map(({ id, post }) => (
              <Post 
                key={id}
                postId={id}
                username={post.username} 
                caption={post.caption} 
                imageUrl={post.imageUrl}
                signedInUser={user?.displayName}/>
            ))
          }
        </div>

        {/** Image Upload */}
        {user?.displayName && (
          <ImageUpload username={user.displayName}/>
        )}
      </div>
    </div>
  );
}

export default App;

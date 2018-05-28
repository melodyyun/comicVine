import React from 'react';
import firebase from 'firebase';
//import { firebaseConfig } from '../firebase/firebase-config';
import {
    BrowserRouter as Router,
    Route,
    Link,
    NavLink,
    browserHistory,
} from 'react-router-dom';

// Initialize Firebase
//firebase.initializeApp(firebaseConfig);

class Auth extends React.Component{
    constructor(){
        super();
        this.state = {
            loggedIn: false,
            userId: null,
            userName:'',
            userImg:'',
        }
        this.loginWithGoogle = this.loginWithGoogle.bind(this);
        this.logout = this.logout.bind(this); 
    }

    componentDidMount() {
        this.dbRef = firebase.database().ref('users/');

        firebase.auth().onAuthStateChanged((user) => {
            if (user !== null) {
                this.dbRef.on('value', (snapshot) => {
                    // console.log(snapshot.val());
                })
                this.setState({
                    loggedIn: true,
                    userName: user.displayName,
                    userImg: user.photoURL,
                    userId: user.uid,
                }, () => {
                    this.props.getUserId(this.state.userId);
                })
            } else {
                this.setState({
                    loggedIn: false
                })
            }
        })
    }

    loginWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then((user) => {
                // console.log(user.user);

                const firebaseUid = user.user.uid;
                const firebaseName = user.user.displayName;
                const firebaseImg = user.user.photoURL;
                this.setState({
                    userId: firebaseUid,
                    userName: firebaseName,
                    userImg: firebaseImg,
                }, () => {
                    // console.log('pushing', this.state.userId);
                    const userInfo = {
                        userName: this.state.userName,
                        userImg: this.state.userImg,
                    }
                    firebase.database().ref(`users/accountInfo/${this.state.userId}`).set(userInfo);
                })
            })
            .catch((err) => {
                console.log(err);
            })
    }

    logout() {
        firebase.auth().signOut();
        this.dbRef.off('value');
        // console.log('signed out');
    }

    render(){
        return(
            <div>
                {
                    this.state.loggedIn === false && <button onClick={this.loginWithGoogle}>Login with Google</button>
                }
                {
                    this.state.loggedIn === true &&
                    <div className="auth-bar">
                        <NavLink to="/account">
                            <img src={this.state.userImg} alt={this.state.userName} />
                        </NavLink>
                        <NavLink to="/">
                            <button onClick={this.logout}>Logout</button>
                        </NavLink>
                    </div>
                }
            </div>
        )
    }
}

export default Auth;


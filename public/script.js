//socket gonna connect to our root path 
const socket = io('/');
const videoGrid = document.getElementById('video-grid');

// first parameter gonna be ID , we'll just pass an undifined , because let the server generating our own ID 
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
});

//get a reference to the video element
const myVideo = document.createElement('video');
// we don't want to play our own video
myVideo.muted = true;

// here we gonna save all the users that are connected to our room
const peers = {};


navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    // the stream gonna be the video that we're gonna play
    addVideoStream(myVideo, stream);

    //*******// when a user calls us, we gonna answer the call 
    // displaying the user video to our video grid and 
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        // responding to the call and display our stream to other users
        call.on('stream', userVideoStream => {
            addVideoStream(video,userVideoStream)
        })
    })

    //allow us to be connected to other users
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    })

});


socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})  

myPeer.on('open', id => {
    //this gonna send an event to the server
    socket.emit('join-room', ROOM_ID, id)
})


socket.on('user-connected', userId => {
    console.log('User connected: ' + userId)
})

// this gonna run when a user connects to the server
function connectToNewUser(userId, stream) {
    //calling the user with the userId and sending our stream to that user
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    // when the user send us back their stream
    call.on('stream', userVideoStream => {
    // we gonna add that stream to our video grid
        addVideoStream(video, userVideoStream);
    })
    // called when the peer closes their connection to us
    call.on('close', () => {
        video.remove();
    })
    // here every userID is directly connected to the call
    peers[userId] = call;
}


// adding a video stream to the video grid
function addVideoStream(video, stream) {
    //this allow us to play our video
    video.srcObject = stream;
    //this gonna play our video
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    //this gonna append our video to the video grid
    videoGrid.append(video);
}

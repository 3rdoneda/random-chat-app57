class PeerService {
    public peer!: RTCPeerConnection;
    private isInitializing = false;

    constructor(){
        this.initPeer();
    }

    initPeer() {
        if (this.isInitializing) {
            console.warn('Peer connection already initializing');
            return;
        }
        
        this.isInitializing = true;
        
        // Reinitialize peer connection
        // console.log("init peer........")
        try {
            if (this.peer && this.peer.signalingState !== 'closed') {
                this.peer.getTransceivers().forEach(transceiver => {
                    if (transceiver && transceiver.stop) {
                        transceiver.stop();
                    }
                });
                this.peer.close(); 
            }
        } catch (error) {
            console.warn('Error closing existing peer connection:', error);
        }

        this.peer = new RTCPeerConnection({
            iceServers: [{
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                    "stun:global.stun.twilio.com:3478",
                    "stun:stun.stunprotocol.org:3478",
                    "stun:stun.voipstunt.com",
                    "stun:stun.services.mozilla.com"
                ]
            }]
        });

        // Add error handling for peer connection
        this.peer.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', this.peer.iceConnectionState);
            if (this.peer.iceConnectionState === 'failed') {
                console.warn('ICE connection failed, attempting restart');
                try {
                    this.peer.restartIce();
                } catch (error) {
                    console.error('Error restarting ICE:', error);
                }
            }
        };

        this.peer.onconnectionstatechange = () => {
            console.log('Connection state:', this.peer.connectionState);
            if (this.peer.connectionState === 'failed') {
                console.warn('Peer connection failed');
            }
        };
        
        this.isInitializing = false;
    }

    async getOffer(){
        try {
            if(this.peer && this.peer.signalingState === 'stable'){
                const offer = await this.peer.createOffer();
                await this.peer.setLocalDescription(new RTCSessionDescription(offer));
                return this.peer.localDescription;
            }
            console.warn('Peer not in stable state for creating offer:', this.peer?.signalingState);
            return null;
        } catch (error) {
            console.error('Error creating offer:', error);
            // Try to reinitialize peer connection
            this.initPeer();
            return null;
        }
    }

    async getAnswer(offer: RTCSessionDescriptionInit){
        try {
            if(this.peer && (this.peer.signalingState === 'stable' || this.peer.signalingState === 'have-remote-offer')){
                await this.peer.setRemoteDescription(offer);
                const answer = await this.peer.createAnswer();
                await this.peer.setLocalDescription(new RTCSessionDescription(answer));
                return this.peer.localDescription;
            }
            console.warn('Peer not in correct state for creating answer:', this.peer?.signalingState);
            return null;
        } catch (error) {
            console.error('Error creating answer:', error);
            // Try to reinitialize peer connection
            this.initPeer();
            return null;
        }
    }

    async setRemoteDescription(answer: RTCSessionDescriptionInit){
        try {
            if(this.peer && this.peer.signalingState === 'have-local-offer'){
                await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
            } else {
                console.warn('Peer not in correct state for setting remote description:', this.peer?.signalingState);
            }
        } catch (error) {
            console.error('Error setting remote description:', error);
            // Try to reinitialize peer connection
            this.initPeer();
        }
    }
    
    // Add method to check if peer is ready
    isPeerReady(): boolean {
        return this.peer && this.peer.signalingState !== 'closed' && !this.isInitializing;
    }
    
    // Add method to safely close peer connection
    closePeer(): void {
        try {
            if (this.peer && this.peer.signalingState !== 'closed') {
                this.peer.close();
            }
        } catch (error) {
            console.error('Error closing peer connection:', error);
        }
    }
}

const peerservice = new PeerService();
export default peerservice;
declare module 'react-confetti' {
    import { Component } from 'react';

    interface ConfettiProps {
        width: number;
        height: number;
        numberOfPieces: number;
        recycle: boolean;
        gravity: number;
    }

    class Confetti extends Component<ConfettiProps> {}
    export default Confetti;
}

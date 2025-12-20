import Confetti from 'react-confetti'
import {useWindowSize} from 'react-use'

export default function Celebration(): React.JSX.Element {
    const {width, height} = useWindowSize()
    return (
        <>
            <Confetti 
                width={width}
                height={height}
                recycle={true}
                numberOfPieces={2000}
            />
        </>
    )
}
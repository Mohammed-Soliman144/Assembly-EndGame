import {Fragment, useEffect, useState, useRef, useMemo } from 'react'
import Celebration from './components/Celebration.tsx'
import { nanoid } from 'nanoid'
import {clsx} from 'clsx'
import languages from './ts/languages.ts'
import {utilies} from './ts/utility.ts'
// Always last import for css file
import "./css/App.css"

export default function App(): React.JSX.Element {
    
    // Constants Random Phases and Word
    const RANDOM_WORDS: string [] = useMemo<string[]> (() => {
        return utilies
    }, []) 


    const RANDOM_SENTENCES: Array<string> = ["R.I.P., %", "We'll miss you, %", "The end of % as we know it", "Adios, %", "Gone but not forgotten, %", "%, it's been real", "Farewell, %", "% bites the dust", "% has left the building", "Oh no, not %!", "%, your watch has ended","Off into the sunset, %"]

    // Add State to handle generating random current word for each new Game 
    const [currentWord, setCurrentWord] = useState<string>(() => RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)])
    // Add State to collect all correct and wrong guess letters
    const [guessLetters, setGuessLetters] = useState(Array<string>)
    // Add State to handle remove one language for each wrong attempts
    const [isRemoved, setIsRemoved] = useState(Array<boolean>)
    // Add state to handle if game over or not (if wrong attempts === 8 => user loss or if correct attempts === length of random word - 1 is user win)
    const [isGameOver, setIsGameOver] = useState<string>("still playing...")
    // Add State to show celebrate
    const [isCelebrate, setIsCelebrate] = useState<boolean>(false);

    // add ref to focus on button New Game when player win or loss from HTMLButtonElement(null)
    // const btn = useRef<HTMLButtonElement>(null) <HTMLButtonElemetn> is datatype (null) is value
    const btnRef = useRef<HTMLButtonElement>(null);
    // add timer id to control of celebration
    const timerId = useRef<number>(0);

    /* Derived Values from states and props
        -- Note Do Not use local variable with let to avoid potential bugs
        -- the perfect choice is use Derived Value from state or props as constants
        -- Add new fail attempts for each press wrong button by setState
    */
    const wrongAttempts: number = guessLetters.filter(letter => !currentWord.toLowerCase().includes(letter)).length; 

    /* Derived Values from states and props
        -- Note Do Not use local variable with let to avoid potential bugs
        -- the perfect choice is use Derived Value from state or props as constants 
        -- Add new correct attempts for each press correct button by setState
    */
    const correctAttempts: number = currentWord.toLowerCase().split('').filter(letter => 
        guessLetters.includes(letter) && guessLetters.length !== 0 ).length

    // Add Languages from languages.ts
    const addLangElements = languages.map((lang, index): React.JSX.Element => 
        {
            // const isRemoved = guessLetters.length > 0 && wrongAttempts > 0;
            // console.log(isRemoved)
            return (
                <span 
                    key={nanoid()} 
                    className={`${ isRemoved[index] === true ? "removed" : ""}`} 
                    id={nanoid()}
                    style={{backgroundColor: lang.background, color: lang.color}}
                >
                {lang.name}
                </span>
            )
        }); 

    

    // Add Characters of currentWord State as span elements
    const addWordElements = currentWord.toLowerCase().split('').map((char): React.JSX.Element => {
        const isGuessed: boolean = guessLetters.includes(char);
        const isValid: boolean = isGuessed && wrongAttempts < languages.length - 1;
        const isInValid: boolean = !isGuessed && wrongAttempts >= languages.length - 1;
        return (
            <Fragment key={nanoid()}> 
                {   isInValid ?
                    <span  className={clsx({'span-invalid': isInValid})}>{char}</span>
                    : 
                    <span className={clsx({'span-valid': isValid})}>{isGuessed? char : ""}</span>
                }
            </Fragment> 
        )
    })
    // clsx({'span-invalid': isInValid})


    // function to handle click event on each button(letter)
    function handleClick(char: string): void {
        // Add new each button(letter) if wrong or correct to guess letter array by setState
        setGuessLetters(oldStateArr => oldStateArr.includes(char) === true ? oldStateArr : [...oldStateArr, char]);   
        
        // Add new boolean value for each wrong attempts (wrong press button) to remove one language from 8 languages by setState
        setIsRemoved(oldState => {
            for(let i =0; i <= wrongAttempts && !currentWord.toLowerCase().includes(char); i++)
                oldState[i] = true;
            return oldState;
        });
        
        return ;
    }


    // function handle generate alphabets by use String.fromCharCode depends on unicode of a-z from 65 - 90
    function alphabets():string [] {
        const alphabets: string [] = [];
        for(let i = 65; i <= 90; i++)
            alphabets.push(String.fromCharCode(i).toLowerCase());
        return alphabets;
    }


    // useEffect
    useEffect(() => {
        if(btnRef && btnRef.current !== null) {
                btnRef.current.focus();
        }
        if(currentWord.length === correctAttempts || wrongAttempts === languages.length - 1) {
            // Check if user win so isGameOver (true) otherwise (false) by using setState
            setIsGameOver(oldState =>{
                if(wrongAttempts < languages.length - 1 && currentWord.length === correctAttempts)
                    oldState =  "still playing..."
                if(wrongAttempts === languages.length - 1 && currentWord.length !== correctAttempts) 
                    oldState = "loss"
                if(wrongAttempts < languages.length - 1 && currentWord.length === correctAttempts) {
                    oldState =  "win"
                    setIsCelebrate(true);
                }
                return  oldState;
            })
        }
        if(correctAttempts === currentWord.length || wrongAttempts === languages.length - 1) {
            timerId.current = window.setTimeout(() => {
                setIsGameOver("still playing...");
                setIsRemoved([]);
                setGuessLetters([]);
                setCurrentWord(RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)])
            }, 6000)
        }

        return () => {
            clearTimeout(timerId.current);
            setIsCelebrate(false);
        }

    }, [currentWord.length, wrongAttempts, correctAttempts, RANDOM_WORDS, isCelebrate])


    // Add new button which is represent for each alphabet letter
    const addButtons = alphabets().map((alpha, index): React.JSX.Element => {
        /*   Logic to handle if is clicked button(letter) is correct or wrong
            -- Note guessLetter is contains only add new letter of button that I clicked on its 
            -- Note So If Is letter exist inside guessLetters array so i clicked on its
            -- Note if the letter of button I clicked on its and its includes inside currentWord Array (like Typescript) so is true (or valid button => which means guess letter that i clicked on it already exist inside current word)
            -- Note if letter of button That I Clicked on its (is true already clicked on its) but its not includes inside currentWord so is false (or not valid => which means guess letter that I clicked on its not exist inside current word)
            -- Note How clsx thirdy package worked its used for replaced nested condition or nested ternary condition or nested conditional rendering
            -- How works its accept object the key of object work with its as string class-name and value of object must be boolean if true will add the key of object as string to className
        */
        const isGuessed: boolean = guessLetters.includes(alpha);
        const isValid: boolean   = isGuessed && currentWord.toLowerCase().includes(alpha);
        const isInValid: boolean = isGuessed && !currentWord.toLowerCase().includes(alpha);
        return (
            <button 
                key={index}
                className={clsx({
                    "btn-valid": isValid,
                    "btn-not-valid": isInValid
                })}
                // style={{backgroundColor: }}
                aria-label={`button with value - ${alpha}`} 
                type='button'
                disabled={currentWord.length === correctAttempts || wrongAttempts === languages.length - 1}
                aria-disabled={isGuessed}
                onClick={() => handleClick(alpha)}
            >
                {alpha}
            </button>
        )
    })

    // console.log(correctAttempts, "correct")
    // console.log(wrongAttempts, "wrong")
    // console.log(currentWord.length)
    // console.log(currentWord.length === correctAttempts, "is equal") 
    // console.log(isGameOver)

    function handleNewGame():void {
        setIsGameOver("still playing...");
        setIsRemoved([]);
        setGuessLetters([]);
        setCurrentWord(RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)])
        if(currentWord.length === correctAttempts || wrongAttempts === languages.length){
            clearTimeout(timerId.current);
            setIsCelebrate(false);
        }
    }

    function getRemovedLang(): string {
        const index: number = Math.floor(Math.random() * RANDOM_SENTENCES.length);
        // console.log(index)
        if(isRemoved.every(ele => ele === true) && isRemoved.length > 0) {
            const langIndex = isRemoved.length > 0 ? isRemoved.filter(ele => ele === true).length - 1 : 0; 
            const lang = languages[langIndex]?.name.toUpperCase();
            // console.log(lang)
            return RANDOM_SENTENCES.map(sentence => sentence.replace(/%/,lang))[index]
        }
        return "";
    }
    
    // console.log((languages.length - 1) - wrongAttempts);
    // console.log(getRemovedLang());
    return(
        <Fragment>
            <div className="container">
                <div className='sr-only'
                aria-live='polite'  >
                    { isGameOver === 'win' && <p>Your won!, Congratualations you can press on enter keyboard to Start New Game"</p> 
                    }
                </div>
                {
                    isCelebrate &&
                    <Celebration/>
                }
                <main>
                    <header className='main-header'>
                        <h1>Assembly: Endgame</h1>
                        <p>Guess the word within 8 attempts to keep the programming world safe from Assembly!</p>
                    </header>
                    <section 
                        className={
                            clsx("status",
                                {   "removed": getRemovedLang().length > 0, 
                                    "win": isGameOver === "win",
                                    "loss": isGameOver === "loss",
                                })
                        } 
                        aria-live='polite' 
                        aria-label="You are win">
                        {
                            isGameOver === "win" ? 
                                    <h2>You win!</h2>
                            : isGameOver === "loss" ? 
                            <h2>Game over!</h2> : ""
                        }
                        {
                            <p 
                                className=
                                {
                                    clsx({
                                            'invisible': getRemovedLang().length === 0, 
                                            'visible': getRemovedLang().length > 0 
                                        })
                                }
                            >
                                {
                                    isGameOver === "win" ? 
                                    <span>Well done! 🎉</span> :
                                    isGameOver === "loss" ? 
                                    <span>You lose! Better start  learning Assembly 😭</span> : 
                                    getRemovedLang()
                                }
                            </p>
                        }
                    </section>
                    <section 
                        className="sr-only" 
                        role="status" 
                        aria-label="status of your letters are choosed from keyboard" aria-live="polite">
                        {isGameOver === 'win' && <p>Congratualation You Won, Please Press on Enter keyboard Button To Start New Game</p>}
                        {isGameOver === 'loss' && <p>Good Luck, keep hands on keyboard and try second attempt again</p>}
                    </section>
                    <section className="languages">
                        <p>{addLangElements}</p>
                    </section>
                    <section className="words">
                        <p>{addWordElements}</p>
                    </section>
                    <section className="sr-only" role="status" aria-label="reveal your letters are selected" aria-live="polite">
                        <p>{addWordElements}</p>
                        <p>Remain attempts: {(languages.length - 1) - wrongAttempts}</p>
                    </section>
                    <section className="buttons">
                        <div className="btns-container">
                            {addButtons}
                        </div>
                        {
                            isGameOver !== 'still playing...' && 
                            <button
                                ref={btnRef}
                                type='button' 
                                aria-label='Start New Game'
                                onClick={handleNewGame}>New Game</button>
                        }
                    </section>
                </main>
            </div>
        </Fragment>
    )
}
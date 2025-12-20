import {createRoot} from 'react-dom/client'
import {StrictMode} from 'react'
import App from './App'
// Last import for css file of main.tsx => main.typeScript xml its called index.css
import './css/index.css'

// document.getElementById('root')! => Non-Null Assertion Operator!
// ! is Non-Null Assertion Operator in TypeScript which ensure the Element is non null or undefined
const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
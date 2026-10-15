import {createRoot} from 'react-dom/client';
import Sushi from './Sushi';
import './sushi.css';
createRoot(document.getElementById('root')!).render(<Sushi route={window.location.pathname.split('/').filter(Boolean)}/>);

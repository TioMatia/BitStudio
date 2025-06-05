import { Link } from 'react-router-dom';
import '../../styles/notFound.css';

export default function NotFound() {
  return (
    <div className="notfound-container">
      <h1>404</h1>
      <p>Página no encontrada</p>
      <Link to="/login">
        Ir al inicio
      </Link>
    </div>
  );
}

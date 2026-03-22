import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import Agendar from "./pages/Agendar";
import Conta from "./pages/Conta";
import EmpresasProfissionais from "./pages/EmpresasProfissionais";
import Entrar from "./pages/Entrar";
import ForgotPassword from "./pages/ForgotPassword";
import Formulario from "./pages/Formulario";
import Home from "./pages/Home";
import MinhasConsultas from "./pages/MinhasConsultas";
import Registrar from "./pages/Registrar";
import ResetPassword from "./pages/ResetPassword";
import Urgencia from "./pages/Urgencia/urgencia";

const ProtectedRoute = ({ element }) => {
    const { user } = useAuth();
    return user ? element : <Navigate to="/entrar" />;
  };
  
  const AppRoutes = () => {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/entrar" element={<Entrar />} />
          <Route path="/registrar" element={<Registrar />} />
          <Route path="/Conta" element={<Conta />} />
          <Route path="/Agendar" element={<Agendar />} />
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          <Route path="/urgencia" element={<Urgencia />} />
          <Route path="/profissionais" element={<EmpresasProfissionais />} />
          <Route path="/minhas-consultas" element={<MinhasConsultas />} />
          <Route path="/Formulario" element={<Formulario />} />
          <Route path="/EsqueciSenha" element={<ForgotPassword />} />
          <Route path="/ResetPassword" element={<ResetPassword />} />
        </Routes>
      </Router>
    );
  };
  
  export default AppRoutes;

import { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser(JSON.parse(storedUser));
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = async (email, senha) => {
    try {
      const { data } = await client.post('/login', { email, senha });
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        return data.user;
      }
      return null;
    } catch (error) {
      console.error('Erro no login:', error);
      return null;
    }
  };

  const logout = () => {
    if (user?.email) {
      localStorage.removeItem(`cart_${user.email}`);
      localStorage.removeItem(`totalAmount_${user.email}`);
    }
    setUser(null);
    setCart([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const addItemToCart = (item) => {
    if (!user) return;
    setCart((prevCart) => {
      const updatedCart = [...prevCart, item];
      localStorage.setItem(`cart_${user.email}`, JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const removeItemFromCart = (productId) => {
    if (!user || !user.email) {
      console.error('Usuário não encontrado');
      return;
    }
    setCart((prevCart) => {
      const updatedCart = prevCart.filter(item => item.id !== productId);
      localStorage.setItem(`cart_${user.email}`, JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const setTotalAmount = (amount) => {
    if (user) {
      localStorage.setItem(`totalAmount_${user.email}`, JSON.stringify(amount));
    }
  };

  return (
    <AuthContext.Provider value={{ user, cart, login, logout, addItemToCart, removeItemFromCart, setTotalAmount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export { AuthContext };


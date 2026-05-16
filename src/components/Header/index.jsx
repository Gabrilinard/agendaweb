import { Bell, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import pngLogoAgende from '../../assets/pnglogoagende.png';
import { useAuth } from '../../contexts/AuthContext';
import {
    Avatar,
    BellBtn,
    BrandArea,
    BrandName,
    BrandTagline,
    BrandText,
    EmergencyBtn,
    EmergencyDot,
    HeaderContent,
    HeaderWrapper,
    LoginBtn,
    LogoCircle,
    LogoImg,
    MobileMenuBtn,
    MobileNav,
    MobileNavLink,
    NavArea,
    NavLink,
    NotifBadge,
    RightArea,
    UserChip,
    UserDetails,
    UserNameText,
    UserRoleText,
} from './style';

const NAV_LINKS = [
    { label: 'Início', path: '/' },
    { label: 'Profissionais', path: '/profissionais' },
    { label: 'Minhas Consultas', path: '/minhas-consultas' },
];

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const initials = user
        ? `${user.nome?.[0] || ''}${user.sobrenome?.[0] || ''}`.toUpperCase()
        : '';
    const tipoLabel = user?.tipoUsuario === 'profissional' ? 'Profissional' : 'Paciente';

    const go = (path) => {
        navigate(path);
        setMobileOpen(false);
    };

    return (
        <HeaderWrapper>
            <HeaderContent>
                <BrandArea onClick={() => go('/')}>
                    <LogoCircle>
                        <LogoImg src={pngLogoAgende} alt="Logo" />
                    </LogoCircle>
                    <BrandText>
                        <BrandName>Agende Aqui</BrandName>
                        <BrandTagline>SAÚDE SOB DEMANDA</BrandTagline>
                    </BrandText>
                </BrandArea>

                <NavArea>
                    {NAV_LINKS.map(link => (
                        <NavLink
                            key={link.path}
                            $active={location.pathname === link.path}
                            onClick={() => go(link.path)}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </NavArea>

                <RightArea>
                    <BellBtn>
                        <Bell size={18} />
                        {user && <NotifBadge />}
                    </BellBtn>
                    {user ? (
                        <UserChip onClick={() => go('/Conta')}>
                            <Avatar>{initials || 'U'}</Avatar>
                            <UserDetails>
                                <UserNameText>{user.nome} {user.sobrenome}</UserNameText>
                                <UserRoleText>{tipoLabel}</UserRoleText>
                            </UserDetails>
                        </UserChip>
                    ) : (
                        <LoginBtn onClick={() => go('/Entrar')}>Entrar</LoginBtn>
                    )}
                </RightArea>

                <MobileMenuBtn onClick={() => setMobileOpen(o => !o)}>
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </MobileMenuBtn>
            </HeaderContent>

            {mobileOpen && (
                <MobileNav>
                    {NAV_LINKS.map(link => (
                        <MobileNavLink key={link.path} onClick={() => go(link.path)}>
                            {link.label}
                        </MobileNavLink>
                    ))}
                    {user ? (
                        <>
                            <MobileNavLink onClick={() => go('/urgencia')}>Consulta Emergente</MobileNavLink>
                            <MobileNavLink onClick={() => go('/Conta')}>Minha Conta</MobileNavLink>
                        </>
                    ) : (
                        <MobileNavLink onClick={() => go('/Entrar')}>Entrar</MobileNavLink>
                    )}
                </MobileNav>
            )}
        </HeaderWrapper>
    );
};

export default Header;

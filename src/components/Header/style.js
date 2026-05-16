import styled from 'styled-components';

const DARK_GREEN = '#1C5C40';
const MID_GREEN = '#2D8A62';
const BG = '#F7F3EE';
const BORDER = '#E5E0DA';

export const HeaderWrapper = styled.header`
  background: #fff;
  border-bottom: 1px solid ${BORDER};
  position: sticky;
  top: 0;
  z-index: 200;
  font-family: 'Figtree', sans-serif;
`;

export const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  height: 64px;

  @media (max-width: 1024px) {
    padding: 0 20px;
    gap: 20px;
  }
`;

/* Brand */
export const BrandArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex-shrink: 0;
`;

export const LogoCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${DARK_GREEN};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
`;

export const LogoImg = styled.img`
  width: 26px;
  height: 26px;
  object-fit: contain;
  filter: brightness(0) invert(1);
`;

export const BrandText = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.1;
`;

export const BrandName = styled.span`
  font-size: 0.95rem;
  font-weight: 700;
  color: #111;
`;

export const BrandTagline = styled.span`
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #888;
`;

/* Nav */
export const NavArea = styled.nav`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const NavLink = styled.button`
  background: ${({ $active }) => $active ? '#E8F5EE' : 'transparent'};
  color: ${({ $active }) => $active ? MID_GREEN : '#444'};
  border: none;
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 0.88rem;
  font-weight: ${({ $active }) => $active ? '600' : '500'};
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;

  &:hover {
    background: #F2EDE8;
    color: ${DARK_GREEN};
  }
`;

/* Right side */
export const RightArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const EmergencyBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  background: #FEF3E2;
  color: #C45E00;
  border: 1.5px solid #F5C97A;
  border-radius: 99px;
  padding: 7px 16px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  transition: background 0.15s;
  white-space: nowrap;

  &:hover {
    background: #FDE8C0;
  }
`;

export const EmergencyDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #E5830F;
  flex-shrink: 0;
`;

export const BellBtn = styled.button`
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  cursor: pointer;
  position: relative;
  transition: background 0.15s;

  &:hover {
    background: #F2EDE8;
  }
`;

export const NotifBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #E53E3E;
  border: 1.5px solid #fff;
`;

export const UserChip = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px 4px 4px;
  border-radius: 99px;
  transition: background 0.15s;

  &:hover {
    background: #F2EDE8;
  }
`;

export const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${DARK_GREEN};
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.2;
`;

export const UserNameText = styled.span`
  font-size: 0.82rem;
  font-weight: 700;
  color: #111;
`;

export const UserRoleText = styled.span`
  font-size: 0.68rem;
  color: #888;
`;

export const LoginBtn = styled.button`
  background: ${DARK_GREEN};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;

  &:hover {
    background: ${MID_GREEN};
  }
`;

/* Mobile */
export const MobileMenuBtn = styled.button`
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  margin-left: auto;
  color: #333;
  padding: 4px;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const MobileNav = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  border-top: 1px solid ${BORDER};
  padding: 12px 20px;
  gap: 4px;
`;

export const MobileNavLink = styled.button`
  background: transparent;
  border: none;
  text-align: left;
  padding: 10px 12px;
  font-size: 0.92rem;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  border-radius: 8px;
  font-family: 'Figtree', sans-serif;

  &:hover {
    background: #F2EDE8;
    color: ${DARK_GREEN};
  }
`;

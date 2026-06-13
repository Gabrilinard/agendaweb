import styled from 'styled-components';

export const DARK_GREEN = '#1C5C40';
export const MID_GREEN = '#2D8A62';
export const BG = '#F7F3EE';
export const BORDER = '#E5E0DA';
export const TEXT = '#111';
export const MUTED = '#666';

export const MONTH_SHORT = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${BG};
  font-family: 'Figtree', sans-serif;
`;

export const Content = styled.div`
  flex: 1;
  max-width: 920px;
  margin: 0 auto;
  padding: 48px 32px;
  width: 100%;

  @media (max-width: 768px) { padding: 32px 16px; }
`;

export const PageTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 600px) { flex-direction: column; }
`;

export const TitleArea = styled.div``;

export const SectionLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${MID_GREEN};
  letter-spacing: 0.12em;
  margin-bottom: 6px;
`;

export const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${TEXT};
  margin: 0 0 8px;
`;

export const PageDesc = styled.p`
  font-size: 0.88rem;
  color: ${MUTED};
  line-height: 1.5;
  margin: 0;
  max-width: 480px;
`;

export const NewBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: ${DARK_GREEN};
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 20px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.2s;

  &:hover { background: ${MID_GREEN}; }
`;

export const TabsRow = styled.div`
  display: flex;
  gap: 4px;
  background: #EDEAE4;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 28px;
  width: fit-content;
`;

export const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 18px;
  border-radius: 9px;
  border: none;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  transition: all 0.15s;
  background: ${({ $active }) => $active ? '#fff' : 'transparent'};
  color: ${({ $active }) => $active ? TEXT : MUTED};
  box-shadow: ${({ $active }) => $active ? '0 1px 4px rgba(0,0,0,0.10)' : 'none'};
`;

export const TabCount = styled.span`
  background: ${({ $active }) => $active ? '#EDEAE4' : 'transparent'};
  color: ${MUTED};
  font-size: 0.75rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 99px;
`;

export const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
`;

export const ConsultaCard = styled.div`
  background: #fff;
  border-radius: 16px;
  border: 1.5px solid ${BORDER};
  overflow: hidden;
`;

export const CardMain = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;

  @media (max-width: 600px) {
    flex-wrap: wrap;
    gap: 14px;
    padding: 16px;
  }
`;

export const DateBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 56px;
  flex-shrink: 0;
  gap: 1px;
`;

export const DateMonth = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  color: ${MUTED};
  letter-spacing: 0.08em;
`;

export const DateDay = styled.span`
  font-size: 1.6rem;
  font-weight: 800;
  color: ${TEXT};
  line-height: 1;
`;

export const DateTime = styled.span`
  font-size: 0.72rem;
  color: ${MUTED};
  font-weight: 500;
`;

export const CardDivider = styled.div`
  width: 1px;
  height: 48px;
  background: ${BORDER};
  flex-shrink: 0;

  @media (max-width: 600px) { display: none; }
`;

export const BadgesRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
`;

export const StatusBadge = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 99px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

export const ModalityBadge = styled.span`
  font-size: 0.72rem;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 99px;
  background: #EDEAE4;
  color: ${MUTED};
`;

export const ProfRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const ProfAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  font-size: 0.78rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const ProfInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ProfName = styled.span`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${TEXT};
`;

export const ProfSpec = styled.span`
  font-size: 0.78rem;
  color: ${MUTED};
`;

export const CardInfoArea = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;

  @media (max-width: 600px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

export const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: none;
  padding: 7px 10px;
  font-size: 0.82rem;
  font-weight: 500;
  color: ${({ $danger }) => $danger ? '#C53030' : TEXT};
  cursor: pointer;
  border-radius: 8px;
  font-family: 'Figtree', sans-serif;
  transition: background 0.15s;

  &:hover {
    background: ${({ $danger }) => $danger ? '#FFF5F5' : '#F2EDE8'};
  }
`;

export const CardFooter = styled.div`
  border-top: 1px solid ${BORDER};
  padding: 10px 24px;
  font-size: 0.8rem;
  color: ${MUTED};
  background: #FAFAF8;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const LibeLink = styled.button`
  background: none;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${TEXT};
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  padding: 0;
  font-family: 'Figtree', sans-serif;
`;

export const ConfirmBar = styled.div`
  border-top: 1px solid #FDDEDE;
  background: #FFF8F8;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: #C53030;
  font-weight: 500;
`;

export const RescheduleBar = styled.div`
  border-top: 1px solid #FED7B0;
  background: #FFF7F0;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: #7C2D12;
  font-weight: 500;
  flex-wrap: wrap;
`;

export const ConfirmBtns = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
`;

export const ConfirmYes = styled.button`
  background: #C53030;
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 6px 16px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  &:hover { background: #A02828; }
`;

export const ConfirmNo = styled.button`
  background: transparent;
  color: ${TEXT};
  border: 1.5px solid ${BORDER};
  border-radius: 7px;
  padding: 6px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  &:hover { background: #F2EDE8; }
`;

export const EmptyMsg = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${MUTED};
  font-size: 0.95rem;
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  z-index: 300;
  display: ${({ $open }) => $open ? 'block' : 'none'};
`;

export const Drawer = styled.div`
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 360px;
  background: #fff;
  z-index: 301;
  padding: 28px 24px;
  box-shadow: -4px 0 24px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  gap: 16px;
  transform: ${({ $open }) => $open ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.25s ease;

  @media (max-width: 480px) { width: 100%; }
`;

export const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const DrawerTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${TEXT};
  margin: 0;
`;

export const CloseBtn = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${MUTED};
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  &:hover { background: #F2EDE8; color: ${TEXT}; }
`;

export const FieldLabel = styled.label`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${MUTED};
  display: block;
  margin-bottom: 6px;
`;

export const FieldInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid ${BORDER};
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: 'Figtree', sans-serif;
  outline: none;
  box-sizing: border-box;
  &:focus { border-color: ${MID_GREEN}; }
`;

export const SaveBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px;
  background: ${DARK_GREEN};
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  margin-top: 8px;
  &:hover { background: ${MID_GREEN}; }
`;

export const DPWrapper = styled.div`
  .react-datepicker-wrapper { width: 100%; }
  .react-datepicker__input-container input {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid ${BORDER};
    border-radius: 8px;
    font-size: 0.9rem;
    font-family: 'Figtree', sans-serif;
    outline: none;
    box-sizing: border-box;
    &:focus { border-color: ${MID_GREEN}; }
  }
`;

import styled from 'styled-components';

const BG = '#F7F3EE';
const DARK_GREEN = '#1C5C40';
const MID_GREEN = '#2D8A62';
const LIGHT_GREEN_BG = '#E0F0E8';
const TEXT_PRIMARY = '#111';
const TEXT_SECONDARY = '#555';
const BORDER = '#E5E0DA';

export const PageWrapper = styled.div`
  background-color: ${BG};
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Figtree', sans-serif;
`;

/* ── Hero ── */
export const HeroSection = styled.section`
  display: flex;
  align-items: center;
  gap: 48px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 60px 40px 40px;

  @media (max-width: 900px) {
    flex-direction: column;
    padding: 40px 20px 30px;
    gap: 32px;
  }
`;

export const HeroLeft = styled.div`
  flex: 1;
  min-width: 0;
`;

export const BadgeNew = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1.5px solid ${BORDER};
  border-radius: 99px;
  padding: 6px 16px;
  font-size: 0.82rem;
  color: ${TEXT_SECONDARY};
  margin-bottom: 22px;

  strong {
    color: ${MID_GREEN};
    font-weight: 700;
  }
`;

export const HeroTitle = styled.h1`
  font-size: 3.8rem;
  font-weight: 800;
  color: ${TEXT_PRIMARY};
  line-height: 1.1;
  margin: 0 0 8px;

  @media (max-width: 768px) {
    font-size: 2.6rem;
  }
`;

export const HeroTitleItalic = styled.span`
  font-style: italic;
  font-weight: 700;
  color: ${DARK_GREEN};
`;

export const HeroDesc = styled.p`
  font-size: 1rem;
  color: ${TEXT_SECONDARY};
  line-height: 1.6;
  max-width: 480px;
  margin: 20px 0 32px;
`;

export const HeroButtons = styled.div`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
`;

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  background-color: ${DARK_GREEN};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 13px 24px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  transition: background 0.2s;

  &:hover {
    background-color: ${MID_GREEN};
  }
`;

export const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  background: transparent;
  color: ${TEXT_PRIMARY};
  border: 1.5px solid ${BORDER};
  border-radius: 8px;
  padding: 12px 22px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  transition: border-color 0.2s, color 0.2s;

  &:hover {
    border-color: ${MID_GREEN};
    color: ${MID_GREEN};
  }
`;

export const OutlineButton = styled.button`
  background: transparent;
  color: ${TEXT_PRIMARY};
  border: 1.5px solid ${BORDER};
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  white-space: nowrap;

  &:hover {
    border-color: ${MID_GREEN};
    color: ${MID_GREEN};
  }
`;

/* ── Calendar Card ── */
export const HeroRight = styled.div`
  flex: 0 0 380px;

  @media (max-width: 900px) {
    flex: 1;
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
  }
`;

export const CalendarCard = styled.div`
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 30px rgba(0,0,0,0.09);
  position: relative;
`;

export const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const CalendarMonth = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: ${TEXT_PRIMARY};
`;

export const CalendarArrow = styled.button`
  background: #F2EDE8;
  border: none;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  font-size: 1.1rem;
  color: ${TEXT_SECONDARY};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;

  &:hover {
    background: ${LIGHT_GREEN_BG};
    color: ${MID_GREEN};
  }
`;

export const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
`;

export const DayLabel = styled.div`
  text-align: center;
  font-size: 0.72rem;
  font-weight: 600;
  color: #aaa;
  padding: 4px 0;
`;

export const DayCell = styled.div`
  text-align: center;
  font-size: 0.82rem;
  padding: 6px 2px;
  border-radius: 50%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ $isEmpty }) => $isEmpty ? 'default' : 'pointer'};
  color: ${({ $isEmpty }) => $isEmpty ? 'transparent' : TEXT_PRIMARY};
  background-color: ${({ $isToday }) => $isToday ? DARK_GREEN : 'transparent'};
  color: ${({ $isToday, $isEmpty }) => $isEmpty ? 'transparent' : $isToday ? '#fff' : TEXT_PRIMARY};
  font-weight: ${({ $isToday, $hasAppointment }) => ($isToday || $hasAppointment) ? '700' : '400'};
  position: relative;

  &::after {
    content: '';
    display: ${({ $hasAppointment, $isToday }) => ($hasAppointment && !$isToday) ? 'block' : 'none'};
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: ${MID_GREEN};
  }
`;

export const AppointmentOverlay = styled.div`
  margin-top: 16px;
  background: #fff;
  border: 1.5px solid ${BORDER};
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
`;

export const ProfAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #D4EAE0;
  color: ${DARK_GREEN};
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const AppointmentInfoWrap = styled.div`
  flex: 1;
  min-width: 0;
`;

export const AppointmentName = styled.div`
  font-size: 0.88rem;
  font-weight: 700;
  color: ${TEXT_PRIMARY};
`;

export const AppointmentSpec = styled.div`
  font-size: 0.75rem;
  color: ${TEXT_SECONDARY};
`;

export const AppointmentConf = styled.div`
  background: #E6F5EC;
  color: ${MID_GREEN};
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  white-space: nowrap;
`;

export const AppointmentDate = styled.div`
  width: 100%;
  font-size: 0.78rem;
  color: ${TEXT_SECONDARY};
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 6px;
  border-top: 1px solid ${BORDER};
`;

/* ── Stats ── */
export const StatsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 40px 40px;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 20px;
    padding: 10px 20px 30px;
  }
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const StatNumber = styled.span`
  font-size: 2.2rem;
  font-weight: 800;
  color: ${TEXT_PRIMARY};
  line-height: 1;
`;

export const StatLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  color: ${TEXT_SECONDARY};
  letter-spacing: 0.08em;
`;

export const StatDivider = styled.div`
  width: 1px;
  height: 40px;
  background: ${BORDER};

  @media (max-width: 600px) {
    width: 60px;
    height: 1px;
  }
`;

/* ── Next Appointment ── */
export const NextAppSection = styled.div`
  max-width: 1200px;
  margin: 0 auto 32px;
  padding: 0 40px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

export const NextAppCard = styled.div`
  background: #E8F5EE;
  border-radius: 16px;
  padding: 20px 28px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const NextAppDateBox = styled.div`
  background: ${DARK_GREEN};
  color: #fff;
  border-radius: 10px;
  width: 56px;
  height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  span {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    opacity: 0.85;
  }

  strong {
    font-size: 1.4rem;
    font-weight: 800;
    line-height: 1;
  }
`;

export const NextAppInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const NextAppLabel = styled.div`
  font-size: 0.68rem;
  font-weight: 700;
  color: ${MID_GREEN};
  letter-spacing: 0.1em;
  margin-bottom: 4px;
`;

export const NextAppName = styled.div`
  font-size: 1.05rem;
  font-weight: 700;
  color: ${TEXT_PRIMARY};
`;

export const NextAppSpec = styled.div`
  font-size: 0.82rem;
  color: ${TEXT_SECONDARY};
`;

/* ── Specialties ── */
export const SpecialtiesSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;

  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

export const SectionLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  color: ${MID_GREEN};
  letter-spacing: 0.12em;
  margin-bottom: 10px;
`;

export const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: ${TEXT_PRIMARY};
  margin: 0 0 8px;

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

export const SectionSubtitle = styled.p`
  font-size: 0.92rem;
  color: ${TEXT_SECONDARY};
  margin: 0 0 32px;
  max-width: 480px;
  line-height: 1.5;
`;

export const SpecialtiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const SpecialtyCard = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 22px 18px;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  border: 1.5px solid transparent;

  &:hover {
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
    transform: translateY(-3px);
    border-color: ${LIGHT_GREEN_BG};
  }
`;

export const SpecialtyIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${LIGHT_GREEN_BG};
  color: ${MID_GREEN};
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
`;

export const SpecialtyName = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${TEXT_PRIMARY};
  margin: 0 0 4px;
`;

export const SpecialtyDesc = styled.p`
  font-size: 0.78rem;
  color: ${TEXT_SECONDARY};
  margin: 0 0 14px;
  line-height: 1.4;
`;

export const SpecialtyLink = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${MID_GREEN};
`;

/* ── Differentials ── */
export const DifferentialsSection = styled.section`
  background: ${BG};
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

export const DifferentialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const DifferentialCard = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 28px 24px;
  border: 1.5px solid ${BORDER};
`;

export const DifferentialIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ $bg }) => $bg || LIGHT_GREEN_BG};
  color: ${({ $color }) => $color || MID_GREEN};
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

export const DifferentialName = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: ${TEXT_PRIMARY};
  margin: 0 0 10px;
`;

export const DifferentialDesc = styled.p`
  font-size: 0.85rem;
  color: ${TEXT_SECONDARY};
  line-height: 1.6;
  margin: 0;
`;

/* ── Legacy exports used by EmpresasProfissionais ── */
export const Container = styled.div`
  background-color: ${BG};
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0 20px;
  font-family: 'Figtree', sans-serif;
`;

export const WelcomeText = styled.p`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${TEXT_PRIMARY};
  max-width: 80%;
  margin-top: 20px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1rem;
    max-width: 100%;
  }
`;

export const EmpresasSection = styled.section`
  padding: 20px 20px 40px;
  background-color: ${BG};

  @media (max-width: 768px) {
    padding: 15px 10px 30px;
  }
`;

export const EmpresasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const EmpresaCard = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.12);
  }
`;

export const EmpresaNome = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${TEXT_PRIMARY};
  margin-bottom: 8px;
`;

export const EmpresaInfo = styled.p`
  font-size: 0.9rem;
  color: ${TEXT_SECONDARY};
  margin: 0;
`;

export const VerMaisButton = styled.button`
  display: block;
  margin: 30px auto;
  padding: 12px 30px;
  background-color: ${DARK_GREEN};
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  font-family: 'Figtree', sans-serif;

  &:hover {
    background-color: ${MID_GREEN};
  }
`;

export const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  position: sticky;
  top: 80px;
  background-color: ${BG};
  padding: 15px 0;
  z-index: 100;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    gap: 10px;
    top: 70px;
  }
`;

export const TabButton = styled.button`
  padding: 12px 30px;
  background-color: ${({ active }) => active ? DARK_GREEN : '#fff'};
  color: ${({ active }) => active ? '#fff' : TEXT_PRIMARY};
  border: 2px solid ${({ active }) => active ? DARK_GREEN : '#ccc'};
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Figtree', sans-serif;

  &:hover {
    background-color: ${({ active }) => active ? MID_GREEN : '#f0f0f0'};
  }

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
`;

export const InscreverButton = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 15px;
  background-color: ${DARK_GREEN};
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  font-family: 'Figtree', sans-serif;

  &:hover {
    background-color: ${MID_GREEN};
  }
`;

export const SearchContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px auto;
  width: 100%;
  max-width: 600px;

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 0 20px;
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
  font-family: 'Figtree', sans-serif;

  &:focus {
    border-color: ${MID_GREEN};
  }

  &::placeholder {
    color: #999;
  }
`;

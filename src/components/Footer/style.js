import styled from 'styled-components';

// Container do footer
export const FooterContainer = styled.footer`
  background-color: #F7F3EE;
  border-top: 1px solid #E5E0DA;
  padding: 28px 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: auto;

  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

export const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

export const LeftSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  flex: 1;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 15px;
  }
`;

export const InstagramLink = styled.a`
  text-decoration: none;
  color: #e959a8;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s ease;

  &:hover {
    color: #C13584;
  }

  @media (max-width: 768px) {
    p {
      text-align: left;
      padding-left: 20px;
    } // centraliza horizontalmente o conteúdo
  }
`;

// Seção da direita
export const RightSection = styled.div`
  display: flex;
  justify-content: space-between;
  width: 45%;
  gap: 50px;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 30px;
  }
`;

export const LocationInfo = styled.div`
  width: 50%;
  margin-bottom: 20px;

  h2 {
    text-align: left;
    font-size: 1.4rem;
  }

  p {
    text-align: left;
    font-size: 1.0rem;
  }

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;

    h2 {
      text-align: left;
      padding-left: 20px;
    }

    p {
      text-align: left;
      padding-left: 20px;
    }
  }
`;

export const ContactInfo = styled.div`
  width: 50%;
  margin-bottom: 20px;

  h2 {
    text-align: left;
    font-size: 1.4rem;
  }

  p {
    text-align: left;
    font-size: 1.0rem;
  }

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;

    h2 {
      text-align: left;
      padding-left: 20px;
    }

    p {
      text-align: left;
      padding-left: 20px;
    }
  }
`;

export const Desenvolvido = styled.div`
  width: 50%;
  margin-bottom: 20px;

  h2 {
    text-align: left;
    font-size: 1.4rem;
  }

  p {
    text-align: left;
    font-size: 1.0rem;
  }

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;

    h2 {
      text-align: left;
      padding-left: 20px;
    }

    p {
      text-align: left;
      padding-left: 20px;
    }
}

  }
`;

export const PrimaryInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1200px;
  gap: 30px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    align-items: center;
    text-align: center;
    gap: 20px;
  }
`;

export const BrandName = styled.h2`
  font-size: 1.2rem;
  font-family: 'Figtree', sans-serif;
  font-weight: bold;
  color: #111111 !important;
  margin: 0;
  text-align: left;

  @media (max-width: 768px) {
    font-size: 1rem;
    text-align: center;
  }
`;

export const Description = styled.p`
  font-size: 0.8rem;
  font-family: 'Figtree', sans-serif;
  color: #555555 !important;
  margin: 0;
  text-align: left;
  line-height: 1.5;
  flex: 1;
  max-width: 500px;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 0 10px;
    text-align: center;
    max-width: 100%;
  }
`;

export const LogoImage = styled.img`
  width: 100%;
  max-width: 120px;
  height: auto;
  border-radius: 12px;
  object-fit: contain;
  flex-shrink: 0;

  @media (max-width: 768px) {
    max-width: 100px;
  }
`;

export const WhatsAppCircle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

export const ContactLabel = styled.span`
  font-size: 1rem;
  font-family: 'Figtree', sans-serif;
  color: #333333;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

export const WhatsAppLink = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

export const WhatsAppIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #25D366;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #20BA5A;
  }

  @media (max-width: 768px) {
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
  }
`;

export const WhatsAppNumber = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  font-family: 'Figtree', sans-serif;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const MediaQueryFooter = styled.div`
  @media (max-width: 480px) {
    ${FooterContainer} {
      padding: 30px 10px;
    }

    ${PrimaryInfo} {
      width: 100%;
      margin-left: 0;
      margin-bottom: 20px;
    }

    ${LocationInfo}, ${ContactInfo}, ${Desenvolvido} {
      width: 100%;
      text-align: center;

      h2, p {
        text-align: center;
        font-size: 0.9rem;
      }
    }
  }
`;

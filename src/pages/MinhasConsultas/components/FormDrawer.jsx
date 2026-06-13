import { X } from 'lucide-react';
import { flattenConteudo } from '../utils';
import { BORDER, CloseBtn, Drawer, DrawerHeader, DrawerTitle, MUTED, Overlay, TEXT } from '../styles';

const FormDrawer = ({ open, onClose, loadingForm, formData }) => (
  <>
    <Overlay $open={open} onClick={onClose} />
    <Drawer $open={open} style={{ width: '420px' }}>
      <DrawerHeader>
        <DrawerTitle>Formulário preenchido</DrawerTitle>
        <CloseBtn onClick={onClose}><X size={20} /></CloseBtn>
      </DrawerHeader>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {loadingForm ? (
          <div style={{ color: MUTED, fontSize: '0.9rem' }}>Carregando...</div>
        ) : formData?.conteudo ? (
          flattenConteudo(formData.conteudo).map(({ label, value }, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${BORDER}`, padding: '10px 0' }}>
              <div style={{ fontSize: '0.73rem', fontWeight: 700, color: MUTED, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
              </div>
              <div style={{ fontSize: '0.88rem', color: TEXT }}>{value}</div>
            </div>
          ))
        ) : (
          <div style={{ color: MUTED, fontSize: '0.9rem' }}>Formulário não encontrado.</div>
        )}
      </div>
    </Drawer>
  </>
);

export default FormDrawer;

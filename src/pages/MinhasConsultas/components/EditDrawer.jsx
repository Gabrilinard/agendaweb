import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  CloseBtn,
  DPWrapper,
  Drawer,
  DrawerHeader,
  DrawerTitle,
  FieldInput,
  FieldLabel,
  Overlay,
  SaveBtn,
} from '../styles';

const EditDrawer = ({ open, onClose, novaData, setNovaData, novoHorario, setNovoHorario, onSalvar }) => {
  const handleHorarioChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length <= 2) setNovoHorario(v);
    else setNovoHorario(v.slice(0, 2) + ':' + v.slice(2, 4));
  };

  return (
    <>
      <Overlay $open={open} onClick={onClose} />
      <Drawer $open={open}>
        <DrawerHeader>
          <DrawerTitle>Editar consulta</DrawerTitle>
          <CloseBtn onClick={onClose}><X size={20} /></CloseBtn>
        </DrawerHeader>

        <div>
          <FieldLabel>Data</FieldLabel>
          <DPWrapper>
            <DatePicker
              selected={novaData}
              onChange={d => d && setNovaData(d)}
              minDate={new Date()}
              dateFormat="dd/MM/yyyy"
              locale="pt-BR"
              showPopperArrow={false}
            />
          </DPWrapper>
        </div>

        <div>
          <FieldLabel>Horário</FieldLabel>
          <FieldInput
            type="text"
            placeholder="HH:MM"
            value={novoHorario}
            onChange={handleHorarioChange}
          />
        </div>

        <SaveBtn onClick={onSalvar}>Salvar alteração</SaveBtn>
      </Drawer>
    </>
  );
};

export default EditDrawer;

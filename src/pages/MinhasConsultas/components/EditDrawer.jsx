import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  CloseBtn,
  DPWrapper,
  Drawer,
  DrawerHeader,
  DrawerTitle,
  FieldLabel,
  FieldSelect,
  Overlay,
  SaveBtn,
} from '../styles';

const EditDrawer = ({
  open,
  onClose,
  novaData,
  setNovaData,
  novoHorario,
  setNovoHorario,
  horariosDisponiveis = [],
  carregandoHorarios = false,
  onSalvar,
}) => {
  const semHorarios = !carregandoHorarios && horariosDisponiveis.length === 0;

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
          <FieldSelect
            value={novoHorario}
            onChange={(e) => setNovoHorario(e.target.value)}
            disabled={carregandoHorarios || semHorarios}
          >
            {carregandoHorarios ? (
              <option value="">Carregando horários…</option>
            ) : semHorarios ? (
              <option value="">Nenhum horário disponível neste dia</option>
            ) : (
              <>
                <option value="">Selecione um horário</option>
                {horariosDisponiveis.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </>
            )}
          </FieldSelect>
        </div>

        <SaveBtn onClick={onSalvar}>Salvar alteração</SaveBtn>
      </Drawer>
    </>
  );
};

export default EditDrawer;

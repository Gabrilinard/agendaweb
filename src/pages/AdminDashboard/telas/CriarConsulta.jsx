import { ptBR } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import { Button, DatePickerWrapper, DivInputContainer, DrawerContainer, DrawerHeader, DrawerTitle, FormContainer, Input, Label } from '../style';

const CriarConsulta = ({
  show,
  drawerRef,
  cpfUsuario,
  setCpfUsuario,
  userId,
  nomeReserva,
  sobrenomeReserva,
  emailReserva,
  telefoneReserva,
  dataReserva,
  setDataReserva,
  horarioReserva,
  setHorarioReserva,
  formatarHorarioBrasil,
  handleCreateReserva
}) => {
  return (
    <DrawerContainer isOpen={show} ref={drawerRef}>
      <DrawerHeader>
        <DrawerTitle>Criar Consulta</DrawerTitle>
      </DrawerHeader>

      <FormContainer style={{ maxWidth: '100%', boxShadow: 'none', padding: 0 }}>
        <Label>CPF do Usuário:</Label>
        <Input
          type="text"
          value={cpfUsuario}
          onChange={(e) => {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length <= 11) {
              let formatado = valor;
              if (valor.length > 3) formatado = valor.slice(0, 3) + '.' + valor.slice(3);
              if (valor.length > 6) formatado = valor.slice(0, 3) + '.' + valor.slice(3, 6) + '.' + valor.slice(6);
              if (valor.length > 9) formatado = valor.slice(0, 3) + '.' + valor.slice(3, 6) + '.' + valor.slice(6, 9) + '-' + valor.slice(9);
              setCpfUsuario(formatado);
            }
          }}
          placeholder="000.000.000-00"
          maxLength={14}
        />

        {userId && (
          <DivInputContainer>
            <div>
              <Label>Nome:</Label>
              <Input type="text" value={nomeReserva} disabled />
            </div>
            <div>
              <Label>Sobrenome:</Label>
              <Input type="text" value={sobrenomeReserva} disabled />
            </div>
            <div>
              <Label>Email:</Label>
              <Input type="email" value={emailReserva} disabled />
            </div>
            <div>
              <Label>Telefone:</Label>
              <Input type="text" value={telefoneReserva} disabled />
            </div>
          </DivInputContainer>
        )}

        <Label>Data da Consulta:</Label>
        <DatePickerWrapper>
          <DatePicker
            selected={dataReserva}
            onChange={(date) => setDataReserva(date)}
            minDate={new Date()}
            dateFormat="dd/MM/yyyy"
            locale={ptBR}
            showPopperArrow={false}
            required
          />
        </DatePickerWrapper>

        <Label>Horário (HH:mm):</Label>
        <Input
          type="text"
          placeholder="HH:MM (ex: 14:30)"
          value={horarioReserva ? formatarHorarioBrasil(horarioReserva) || horarioReserva : ''}
          onChange={(e) => {
            let valor = e.target.value.replace(/\D/g, '');

            if (valor.length <= 2) {
              setHorarioReserva(valor);
            } else if (valor.length <= 4) {
              setHorarioReserva(valor.slice(0, 2) + ':' + valor.slice(2));
            } else {
              setHorarioReserva(valor.slice(0, 2) + ':' + valor.slice(2, 4));
            }
          }}
          onBlur={(e) => {
            let valor = e.target.value;
            if (!valor) return;

            if (valor.includes(' ')) {
              const partes = valor.split(' ');
              if (partes.length >= 2) {
                const horaMinuto = partes[0];
                const periodo = partes[1].toUpperCase();
                const [hora, minuto] = horaMinuto.split(':');
                let horas = parseInt(hora, 10);

                if (periodo === 'PM' && horas !== 12) {
                  horas += 12;
                } else if (periodo === 'AM' && horas === 12) {
                  horas = 0;
                }

                valor = `${String(horas).padStart(2, '0')}:${minuto || '00'}`;
              }
            }

            const horarioFormatado = formatarHorarioBrasil(valor);
            if (horarioFormatado && horarioFormatado.match(/^\d{2}:\d{2}$/)) {
              const [h, m] = horarioFormatado.split(':');
              if (parseInt(h) >= 0 && parseInt(h) <= 23 && parseInt(m) >= 0 && parseInt(m) <= 59) {
                setHorarioReserva(horarioFormatado);
              }
            } else if (valor.match(/^\d{2}:\d{2}$/)) {
              const [h, m] = valor.split(':');
              if (parseInt(h) >= 0 && parseInt(h) <= 23 && parseInt(m) >= 0 && parseInt(m) <= 59) {
                setHorarioReserva(valor);
              }
            }
          }}
          maxLength={5}
          required
        />

        <Button onClick={handleCreateReserva} style={{ width: '100%', marginTop: '10px' }}>
          Criar Consulta
        </Button>
      </FormContainer>
    </DrawerContainer>
  );
};

export default CriarConsulta;


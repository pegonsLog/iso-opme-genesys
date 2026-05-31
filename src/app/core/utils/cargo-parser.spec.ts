import { dividirDocumentos, parseDescritivoCargo } from './cargo-parser';

/** Texto representativo do documento POP-02-RQ-08 (Representante Comercial - Gastro). */
const DOC_GASTRO = `DESCRITIVO DE CARGO

Código: POP-02-RQ-08
Data: 06/06/2026
Revisão: 03

IDENTIFICAÇÃO
Cargo	CBO	Departamento	Setor	Superior Imediato
Representante Comercial - Gastro	5211-05	Comercial	Vendas	Coordenador/Gerente de Comercial/CEO

ATIVIDADES
OBJETIVO:
Representar a empresa junto a médicos especialistas, clínicas, hospitais, distribuidores e demais parceiros estratégicos da área de gastroenterologia e coloproctologia.

DETALHAMENTO:
Prospectar novos clientes, clínicas, hospitais, distribuidores e profissionais de saúde;
Desenvolver e manter relacionamento comercial sólido com clientes ativos;
Realizar visitas comerciais e técnicas conforme planejamento estabelecido;
Conduzir todo o ciclo comercial, desde a prospecção até o fechamento da venda;

AUTORIDADES ASSOCIADAS À FUNÇÃO: Negociar condições comerciais dentro dos limites estabelecidos pela empresa;
Solicitar suporte técnico, operacional ou regulatório para atendimento das demandas dos clientes;
Representar a empresa perante clientes, distribuidores e parceiros dentro de sua área de atuação;

REQUISITOS DO CARGO
FORMAÇÃO: Ensino superior completo

EXPERIÊNCIA: Desejável experiência mínima de 12 meses em vendas consultivas, representação comercial ou desenvolvimento de negócios.

COMPETÊNCIAS TÉCNICAS: Conhecimento em vendas consultivas e negociação;
Conhecimento do mercado médico-hospitalar e da área da saúde;
Inglês intermediário;
Domínio do Pacote Office.

COMPETÊNCIAS COMPORTAMENTAIS: Atenção aos detalhes e precisão na execução das tarefas;
Organização e disciplina no trabalho;
Boa comunicação e trabalho em equipe;

TREINAMENTOS OBRIGATÓRIOS
Integração	Admissional
Sistema de Gestão da Qualidade	Anual
ISSO 13485	Anual
Compliance	Anual
LGPD	Anual
Procedimentos da área	Anual

RESPONSABILIDADES:
Desenvolver suas atividades de acordo com os procedimentos estabelecidos. Respeitar e acatar as decisões tomadas pelas chefias imediatas. Ser pontual e assíduo.

EPIS E CONDIÇÕES ESPECÍFICAS DA ATIVIDADE: Disponibilidade para viagens, visitas a clientes, hospitais, clínicas, distribuidores, participação em congressos.

Assinatura do gestor da área:
Assinatura do RH:`;

describe('cargo-parser', () => {
  it('divide um único documento em um bloco', () => {
    expect(dividirDocumentos(DOC_GASTRO).length).toBe(1);
  });

  it('extrai o cabeçalho documental', () => {
    const c = parseDescritivoCargo(DOC_GASTRO);
    expect(c.codigo).toBe('POP-02-RQ-08');
    expect(c.revisao).toBe('03');
    expect(c.dataDocumento).toBe('2026-06-06');
  });

  it('extrai a identificação do cargo', () => {
    const c = parseDescritivoCargo(DOC_GASTRO);
    expect(c.nome).toBe('Representante Comercial - Gastro');
    expect(c.cbo).toBe('5211-05');
    expect(c.departamento).toBe('Comercial');
    expect(c.setor).toBe('Vendas');
    expect(c.superiorImediato).toContain('Coordenador');
  });

  it('extrai objetivo, detalhamento e autoridades', () => {
    const c = parseDescritivoCargo(DOC_GASTRO);
    expect(c.objetivo).toContain('Representar a empresa');
    expect(c.detalhamento.length).toBe(4);
    expect(c.autoridades.length).toBe(3);
  });

  it('extrai requisitos e competências', () => {
    const c = parseDescritivoCargo(DOC_GASTRO);
    expect(c.escolaridade).toBe('Ensino superior completo');
    expect(c.experiencia).toContain('12 meses');
    expect(c.competenciasTecnicas.length).toBe(4);
    expect(c.competenciasComportamentais.length).toBe(3);
  });

  it('extrai treinamentos com periodicidade e corrige ISSO->ISO', () => {
    const c = parseDescritivoCargo(DOC_GASTRO);
    expect(c.treinamentosObrigatorios.length).toBe(6);
    const integracao = c.treinamentosObrigatorios.find((t) => t.nome === 'Integração');
    expect(integracao?.periodicidade).toBe('Admissional');
    const iso = c.treinamentosObrigatorios.find((t) => t.nome.includes('ISO 13485'));
    expect(iso).toBeTruthy();
    expect(iso?.periodicidade).toBe('Anual');
  });

  it('não captura assinaturas no final', () => {
    const c = parseDescritivoCargo(DOC_GASTRO);
    const tudo = JSON.stringify(c);
    expect(tudo).not.toContain('Assinatura');
  });
});
